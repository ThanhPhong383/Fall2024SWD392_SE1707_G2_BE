/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Users } from 'prisma-client';
import { CreateUserDto } from 'src/dto/users/create-user.dto';
import { PrismaService } from 'src/system/database/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // Cập nhật thông tin user (bao gồm cập nhật role)
  async updateUserRole(userId: string, role: string): Promise<Users> {
    return this.prismaService.users.update({
      where: { id: userId },
      data: { role },
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<Users> {
    return this.prismaService.users.create({ data: createUserDto });
  }

  async findAllUsers(): Promise<Users[]> {
    return this.prismaService.users.findMany();
  }

  async findUserById(id: string): Promise<Users | null> {
    return this.prismaService.users.findUnique({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<Users | null> {
    return this.prismaService.users.findFirst({ where: { email } });
  }

  async updateUser(id: string, updateUserDto: object): Promise<Users> {
    return this.prismaService.users.update({ where: { id }, data: updateUserDto });
  }

  async deleteUser(id: string): Promise<Users> {
    return this.prismaService.users.delete({ where: { id } });
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<Users> {
    return this.prismaService.users.update({ where: { id }, data: { refreshToken } });
  }

  // Kiểm tra xem user có đơn hàng chờ xử lý không
  async hasPendingOrders(userId: string): Promise<boolean> {
    const pendingOrders = await this.prismaService.orders.findMany({
      where: { userId, status: 'Pending' },
    });
    return pendingOrders.length > 0;
  }
}
