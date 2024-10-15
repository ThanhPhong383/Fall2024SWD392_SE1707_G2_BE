/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '../dto/auth/login.dto';
import { RegisterDto } from '../dto/auth/register.dto';
import { apiFailed, apiSuccess } from 'src/dto/api-response';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from 'src/repositories/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { email, password, firstName, lastName } = registerDto;
      const existedEmail = await this.usersRepository.findUserByEmail(email);

      if (existedEmail) {
        throw apiFailed(400, null, 'Email was existed!');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await this.usersRepository.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'user',
        isActive: true,
        createdDate: new Date().toISOString()
      });

      return apiSuccess(200, null, 'Register successfully.');
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw apiFailed(500, null, error.meta?.message || error.message);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const user = await this.usersRepository.findUserByEmail(email);
      const comparedPassword = await bcrypt.compare(password, user.password);
      if (!user || !comparedPassword) {
        throw apiFailed(400, null, 'Invalid credentials.');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.usersRepository.updateRefreshToken(user.id, tokens.refreshToken);
      return apiSuccess(200, tokens, 'Login successfully.');
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw apiFailed(500, null, error.meta?.message || error.message);
    }
  }

  async logout(userId: string) {
    try {
      await this.usersRepository.updateRefreshToken(userId, null);
      return apiSuccess(200, null, 'Logout successfully.');
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw apiFailed(500, null, error.meta?.message || error.message);
    }
  }

  async refreshToken(userId: string, token: string) {
    try {
      const user = await this.usersRepository.findUserById(userId);
      const comparedToken = await bcrypt.compare(token, user.refreshToken);
      if (!user || !user.refreshToken || !comparedToken) {
        throw apiFailed(400, null, 'Invalid refresh token.');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.usersRepository.updateRefreshToken(user.id, tokens.refreshToken);
      return apiSuccess(200, tokens, 'refresh token successfully.');
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw apiFailed(500, null, error.meta?.message || error.message);
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    try {
      const accessToken = this.jwtService.sign({ userId, email, role }, { expiresIn: '15m' });
      const refreshToken = this.jwtService.sign({ userId, email, role }, { expiresIn: '7d' });
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      const response = {
        accessToken,
        refreshToken: hashedRefreshToken,
      };

      return response;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw apiFailed(500, null, error.meta?.message || error.message);
    }
  }

  async decodeToken(token: string) {
    try {
      const secret = this.config.get('JWT_SECRET');
      const decodedToken = await this.jwtService.verifyAsync(token, {
        secret: secret,
        algorithms: ['HS256'],
      });
      return decodedToken;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw apiFailed(500, null, error.meta?.message || error.message);
    }
  }

  async verifyToken(token: string): Promise<string | null> {
    try {
      if (!token) {
        throw apiFailed(400, null, 'Token is required!');
      }
      const decodedToken = await this.decodeToken(token);
      if (decodedToken.userId && decodedToken.exp < Date.now()) {
        return decodedToken;
      }
      return null;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw apiFailed(500, null, error.meta?.message || error.message);
    }
  }

  async verifyAdminToken(token: string): Promise<boolean> {
    try {
      if (!token) {
        throw apiFailed(400, null, 'Token is required!');
      }
      const decodedToken = await this.decodeToken(token);
      if (decodedToken.userId && decodedToken.exp < Date.now()) {
        const account = await this.usersRepository.findUserById(decodedToken.userId);
        if (account?.id === decodedToken.userId && account?.role === 'admin' && decodedToken.role === 'admin') {
          return decodedToken;
        }
      }
      return null;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw apiFailed(500, null, error.meta?.message || error.message);
    }
  }
}