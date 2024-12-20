import { Injectable } from '@nestjs/common';
import { Users } from 'prisma-client';
import { CreateUserDto } from 'src/dto/users/create-user.dto';
import { PrismaService } from 'src/system/database/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async updateUserRole(userId: string, role: string): Promise<Users> {
    return this.prismaService.users.update({
      where: { id: userId },
      data: { role },
    });
  }
  // Tạo người dùng với `createdDate` tự động
  async createUser(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, role, isActive } =
      createUserDto;

    return this.prismaService.users.create({
      data: {
        email,
        password,
        firstName,
        lastName,
        role,
        isActive,
        createdDate: new Date(), // Thêm createdDate tại đây
      },
    });
  }

  async findAllUsers(): Promise<Users[]> {
    return this.prismaService.users.findMany();
  }

  async findUserById(id: string): Promise<Users | null> {
    return this.prismaService.users.findUnique({ where: { id } });
  }
  // Tìm người dùng theo tên
  async findUsersByName(name: string) {
    return this.prismaService.users.findMany({
      where: {
        OR: [
          { firstName: { contains: name, mode: 'insensitive' } },
          { lastName: { contains: name, mode: 'insensitive' } },
        ],
      },
    });
  }
  async findUserByEmail(email: string): Promise<Users | null> {
    return this.prismaService.users.findFirst({ where: { email } });
  }

  async updateUser(id: string, updateUserDto: object): Promise<Users> {
    return this.prismaService.users.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async deleteUser(id: string): Promise<Users> {
    return this.prismaService.users.delete({ where: { id } });
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<Users> {
    return this.prismaService.users.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async hasPendingOrders(userId: string): Promise<boolean> {
    const pendingOrders = await this.prismaService.orders.findMany({
      where: { userId, status: 'Pending' },
    });
    return pendingOrders.length > 0;
  }
}
