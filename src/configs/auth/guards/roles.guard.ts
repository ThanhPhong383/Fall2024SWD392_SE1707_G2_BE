import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
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

    // Nếu không yêu cầu vai trò nào, cho phép truy cập.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Nếu không có thông tin user (khách hàng chưa đăng nhập), kiểm tra vai trò Customer.
    if (!user) {
      const isCustomerAllowed = requiredRoles.includes(Roles.Customer);
      if (!isCustomerAllowed) {
        throw new ForbiddenException('Access denied for non-registered users');
      }
      return true;
    }

    // Kiểm tra vai trò của user trong danh sách vai trò yêu cầu.
    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('User does not have the required roles');
    }

    return true;
  }
}
