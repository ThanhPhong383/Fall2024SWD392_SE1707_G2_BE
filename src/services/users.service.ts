import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from 'src/repositories/users.repository';
import { ProductsRepository } from 'src/repositories/products.repository';
import { CreateUserDto } from 'src/dto/users/create-user.dto';
import { UpdateUserDto } from 'src/dto/users/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  // Tạo tài khoản người dùng mới
  async create(createUserDto: CreateUserDto) {
    const createdUser = await this.usersRepository.createUser(createUserDto);
    return { message: 'User created successfully.', data: createdUser };
  }

  // Lấy danh sách tất cả người dùng
  async findAllUsers() {
    const users = await this.usersRepository.findAllUsers();
    return { message: 'Users retrieved successfully.', data: users };
  }

  // Lấy người dùng theo ID
  async findUserById(id: string) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return { message: 'User retrieved successfully.', data: user };
  }

  // Cập nhật thông tin người dùng
  async update(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const updatedUser = await this.usersRepository.updateUser(
      userId,
      updateUserDto,
    );
    return { message: 'User updated successfully.', data: updatedUser };
  }

  // Xóa người dùng
  async remove(userId: string) {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    await this.usersRepository.deleteUser(userId);
    return { message: 'User deleted successfully.' };
  }

  // Chuyển Supplier sang User và vô hiệu hóa sản phẩm của họ
  async switchSupplierToUser(supplierId: string) {
    const user = await this.usersRepository.findUserById(supplierId);
    if (!user) {
      throw new NotFoundException('Supplier not found.');
    }
    await this.productsRepository.disableProductsBySupplier(supplierId);
    const updatedUser = await this.usersRepository.updateUser(supplierId, {
      role: 'User',
    });
    return {
      message: 'Supplier switched to User successfully.',
      data: updatedUser,
    };
  }

  // Yêu cầu chuyển sang Supplier
  async requestSupplierRole(userId: string) {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (user.role === 'Supplier') {
      throw new ForbiddenException('User is already a supplier.');
    }
    const hasPendingOrders =
      await this.usersRepository.hasPendingOrders(userId);
    if (hasPendingOrders) {
      throw new ForbiddenException(
        'Cannot switch role while having pending orders.',
      );
    }
    return { message: 'Supplier role requested. Waiting for Admin approval.' };
  }
}
