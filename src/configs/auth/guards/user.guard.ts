import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../../services/auth.service';

@Injectable()
export class UserGuard implements CanActivate {
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
      const decodedToken = await this.authService.verifyToken(accessToken);

      if (!decodedToken) {
        throw new UnauthorizedException('Invalid token');
      }

      request.user = decodedToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
