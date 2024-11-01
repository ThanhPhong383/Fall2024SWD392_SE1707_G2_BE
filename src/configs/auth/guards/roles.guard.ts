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
    console.log('Running RolesGuard...');

    const requiredRoles = this.reflector.get<Roles[]>(
      'roles',
      context.getHandler(),
    );
    console.log(`Required roles for route: ${requiredRoles}`);

    // Nếu không yêu cầu vai trò cụ thể, cho phép truy cập.
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('No specific roles required for this route.');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Nếu không có thông tin người dùng (chưa đăng nhập), kiểm tra quyền Customer.
    if (!user) {
      console.log('No user information found in request.');
      if (!requiredRoles.includes(Roles.Customer)) {
        console.log(
          `Access denied. User needs to log in and have one of the following roles: ${requiredRoles.join(', ')}`,
        );
        throw new UnauthorizedException(
          'Access denied. Please login to access this resource.',
        );
      }
      return true;
    }

    // Kiểm tra xem người dùng có vai trò phù hợp với yêu cầu.
    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole) {
      console.log(
        `User does not have the required roles. User roles: ${user.roles}. Required roles: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException(
        `Access denied. You need one of the following roles: ${requiredRoles.join(', ')}.`,
      );
    }

    console.log(`Access granted to user: ${JSON.stringify(user)}`);
    return true;
  }
}
