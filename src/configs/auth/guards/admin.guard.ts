import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
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

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const decodedToken = await this.authService.verifyAdminToken(accessToken);
      if (!decodedToken || decodedToken.role !== 'Admin') {
        throw new ForbiddenException('User is not an admin');
      }
      request.user = decodedToken; // Gắn thông tin user vào request
      return true;
    } catch (error) {
      console.error('Token verification failed:', error); // Ghi log lỗi
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
