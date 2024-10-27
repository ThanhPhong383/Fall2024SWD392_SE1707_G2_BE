import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../../services/auth.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request?.headers?.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const decoded = await this.authService.verifyToken(token);

      if (!decoded || decoded.role !== 'admin') {
        throw new UnauthorizedException('Admin rights required');
      }

      request.user = decoded; // Lưu thông tin người dùng vào request
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
