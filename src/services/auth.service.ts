/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '../dto/auth/login.dto';
import { RegisterDto } from '../dto/auth/register.dto';
import { apiSuccess } from 'src/dto/api-response';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from 'src/repositories/users.repository';
import { Roles } from '../types/roles.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // Đăng ký tài khoản mới
  async register(registerDto: RegisterDto) {
    try {
      const { email, password, firstName, lastName, role } = registerDto;

      if (![Roles.User, Roles.Supplier].includes(role)) {
        throw new HttpException('Invalid role! Must be User or Supplier.', HttpStatus.BAD_REQUEST);
      }

      const existingUser = await this.usersRepository.findUserByEmail(email);
      if (existingUser) {
        throw new HttpException('Email already exists!', HttpStatus.BAD_REQUEST);
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

      return apiSuccess(201, null, 'User registered successfully.');
    } catch (error: unknown) {
      this.logger.error(`Registration failed: ${(error as Error).message}`);
      throw new HttpException('Registration failed.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Đăng nhập người dùng
  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      const user = await this.usersRepository.findUserByEmail(email);
      if (!user || !user.password) {
        throw new UnauthorizedException('Invalid credentials.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials.');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.usersRepository.updateRefreshToken(user.id, tokens.refreshToken);

      return apiSuccess(200, tokens, 'Login successful.');
    } catch (error: unknown) {
      this.logger.error(`Login failed: ${(error as Error).message}`);
      throw new HttpException('Login failed.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Tạo JWT Tokens
  private async generateTokens(userId: string, email: string, role: string) {
    const accessToken = this.jwtService.sign(
      { userId, email, role },
      { expiresIn: this.config.get<string>('JWT_EXPIRES_IN') || '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { userId, email, role },
      { expiresIn: '7d' },
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    return { accessToken, refreshToken: hashedRefreshToken };
  }

  // Làm mới token
  async refreshToken(userId: string, refreshToken: string) {
    try {
      const user = await this.usersRepository.findUserById(userId);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.usersRepository.updateRefreshToken(user.id, tokens.refreshToken);

      return apiSuccess(200, tokens, 'Token refreshed successfully.');
    } catch (error: unknown) {
      this.logger.error(`Token refresh failed: ${(error as Error).message}`);
      throw new HttpException('Failed to refresh token.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Đăng xuất người dùng
  async logout(userId: string) {
    try {
      await this.usersRepository.updateRefreshToken(userId, null);
      return apiSuccess(200, null, 'Logged out successfully.');
    } catch (error: unknown) {
      this.logger.error(`Logout failed: ${(error as Error).message}`);
      throw new HttpException('Logout failed.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Xác minh token của Admin
  async verifyAdminToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.role !== Roles.Admin) {
        throw new UnauthorizedException('Invalid admin token.');
      }
      return decoded;
    } catch (error: unknown) {
      this.logger.error(`Admin token verification failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid token.');
    }
  }

  // Xác minh token chung
  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error: unknown) {
      this.logger.error(`Token verification failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid token.');
    }
  }

  // Giải mã token
  async decodeToken(token: string) {
    try {
      return this.jwtService.decode(token);
    } catch (error: unknown) {
      this.logger.error(`Token decoding failed: ${(error as Error).message}`);
      throw new HttpException('Invalid token.', HttpStatus.UNAUTHORIZED);
    }
  }
}
