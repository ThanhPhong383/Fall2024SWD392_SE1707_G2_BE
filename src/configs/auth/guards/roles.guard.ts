import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../../../types/roles.enum'; // Sử dụng enum Roles

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Roles[]>(
      'roles',
      context.getHandler(),
    );

    // Nếu không yêu cầu vai trò cụ thể, cho phép truy cập.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Nếu không có thông tin người dùng (chưa đăng nhập), kiểm tra quyền Customer.
    if (!user) {
      if (!requiredRoles.includes(Roles.Customer)) {
        throw new UnauthorizedException(
          'Access denied. Please login to access this resource.',
        );
      }
      return true;
    }

    // Kiểm tra xem người dùng có vai trò phù hợp với yêu cầu.
    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. You need one of the following roles: ${requiredRoles.join(', ')}.`,
      );
    }

    return true;
  }
}
