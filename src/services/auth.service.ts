/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '../dto/auth/login.dto';
import { RegisterDto } from '../dto/auth/register.dto';
import { apiFailed, apiSuccess } from 'src/dto/api-response';
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
    const { email, password, firstName, lastName, role } = registerDto;

    if (![Roles.User, Roles.Supplier].includes(role)) {
      throw apiFailed(400, null, 'Invalid role! Must be User or Supplier.');
    }

    const existingUser = await this.usersRepository.findUserByEmail(email);
    if (existingUser) {
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

    return apiSuccess(201, null, 'User registered successfully.');
  }

  // Đăng nhập
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findUserByEmail(email);
    if (!user || !user.password) {
      throw apiFailed(401, null, 'Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw apiFailed(401, null, 'Invalid credentials.');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.usersRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return apiSuccess(200, tokens, 'Login successful.');
  }

  // Xác minh token của Admin
  async verifyAdminToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.role !== 'Admin') {
        throw new UnauthorizedException('Invalid admin token.');
      }
      return decoded;
    } catch (error) {
      const err = error as Error; // Ép kiểu 'unknown' thành Error
      this.logger.error(`Token verification failed: ${err.message}`);
      throw new UnauthorizedException('Invalid token.');
    }
  }

  // Xác minh token của User
  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      const err = error as Error; // Ép kiểu 'unknown' thành Error
      this.logger.error(`Token verification failed: ${err.message}`);
      throw new UnauthorizedException('Invalid token.');
    }
  }

  // Tạo token
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
    return { accessToken, refreshToken: hashedRefreshToken };
  }

  // Làm mới token
  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.usersRepository.findUserById(userId);
    if (!user || !user.refreshToken) {
      throw apiFailed(401, null, 'Invalid refresh token.');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!isRefreshTokenValid) {
      throw apiFailed(401, null, 'Invalid refresh token.');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.usersRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return apiSuccess(200, tokens, 'Token refreshed successfully.');
  }

  // Đăng xuất người dùng
  async logout(userId: string) {
    await this.usersRepository.updateRefreshToken(userId, null);
    return apiSuccess(200, null, 'Logged out successfully.');
  }
}
