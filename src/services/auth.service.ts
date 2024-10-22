/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '../dto/auth/login.dto';
import { RegisterDto } from '../dto/auth/register.dto';
import { apiFailed, apiSuccess } from 'src/dto/api-response';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from 'src/repositories/users.repository';
import { Roles } from '../types/roles.enum'; // Import Enum Roles

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // Đăng ký tài khoản mới với vai trò User hoặc Supplier
  async register(registerDto: RegisterDto) {
    try {
      const { email, password, firstName, lastName, role } = registerDto;

      if (![Roles.User, Roles.Supplier].includes(role)) {
        throw apiFailed(
          400,
          null,
          'Invalid role! Role must be User or Supplier.',
        );
      }

      const existedEmail = await this.usersRepository.findUserByEmail(email);
      if (existedEmail) {
        throw apiFailed(400, null, 'Email already exists!');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await this.usersRepository.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        isActive: true,
        createdDate: new Date().toISOString(),
      });

      return apiSuccess(200, null, 'Register successfully.');
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw apiFailed(500, null, error.message || 'Registration failed.');
    }
  }

  // Đăng nhập và trả về token
  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      const user = await this.usersRepository.findUserByEmail(email);
      if (!user || !user.password) {
        throw apiFailed(400, null, 'Invalid credentials.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw apiFailed(400, null, 'Invalid credentials.');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.usersRepository.updateRefreshToken(
        user.id,
        tokens.refreshToken,
      );

      return apiSuccess(200, tokens, 'Login successfully.');
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw apiFailed(500, null, error.message || 'Login failed.');
    }
  }

  // Đăng xuất bằng cách xóa refresh token
  async logout(userId: string) {
    try {
      await this.usersRepository.updateRefreshToken(userId, null);
      return apiSuccess(200, null, 'Logout successfully.');
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw apiFailed(500, null, error.message || 'Logout failed.');
    }
  }

  // Làm mới token
  async refreshToken(userId: string, token: string) {
    try {
      const user = await this.usersRepository.findUserById(userId);

      if (!user || !user.refreshToken) {
        throw apiFailed(400, null, 'Invalid refresh token.');
      }

      const isTokenValid = await bcrypt.compare(token, user.refreshToken);
      if (!isTokenValid) {
        throw apiFailed(400, null, 'Invalid refresh token.');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.usersRepository.updateRefreshToken(
        user.id,
        tokens.refreshToken,
      );

      return apiSuccess(200, tokens, 'Refresh token successfully.');
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw apiFailed(500, null, error.message || 'Refresh token failed.');
    }
  }

  // Tạo Access Token và Refresh Token
  private async generateTokens(userId: string, email: string, role: string) {
    const accessToken = this.jwtService.sign(
      { userId, email, role },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { userId, email, role },
      { expiresIn: '7d' },
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    return {
      accessToken,
      refreshToken: hashedRefreshToken,
    };
  }

  // Giải mã token
  async decodeToken(token: string) {
    try {
      const secret = this.config.get<string>('JWT_SECRET');
      return await this.jwtService.verifyAsync(token, { secret });
    } catch (error: any) {
      throw apiFailed(401, null, 'Invalid token.');
    }
  }

  // Xác thực token
  async verifyToken(token: string): Promise<string | null> {
    try {
      if (!token) {
        throw apiFailed(400, null, 'Token is required!');
      }

      const decoded = await this.decodeToken(token);
      return decoded.exp > Date.now() / 1000 ? decoded : null;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw apiFailed(500, null, error.message || 'Token verification failed.');
    }
  }

  // Xác thực Admin Token và trả về decoded token
  async verifyAdminToken(
    token: string,
  ): Promise<{ userId: string; role: string }> {
    try {
      if (!token) {
        throw apiFailed(400, null, 'Token is required!');
      }

      const decoded = await this.decodeToken(token);

      if (decoded.role !== Roles.Admin) {
        throw apiFailed(403, null, 'User is not an admin');
      }

      return { userId: decoded.userId, role: decoded.role };
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw apiFailed(
        500,
        null,
        error.message || 'Admin token verification failed.',
      );
    }
  }
}
