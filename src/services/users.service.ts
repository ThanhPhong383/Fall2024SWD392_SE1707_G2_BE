import { Injectable, ForbiddenException } from '@nestjs/common';
import { UsersRepository } from 'src/repositories/users.repository';
import { ProductsRepository } from 'src/repositories/products.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async create(createUserDto) {
    return this.usersRepository.createUser(createUserDto);
  }

  async findAllUsers() {
    return this.usersRepository.findAllUsers();
  }

  async findUserById(id: string) {
    return this.usersRepository.findUserById(id);
  }

  async update(id: string, updateUserDto: object) {
    return this.usersRepository.updateUser(id, updateUserDto);
  }

  async remove(id: string) {
    return this.usersRepository.deleteUser(id);
  }

  // Chuyển Supplier thành User
  async switchSupplierToUser(supplierId: string) {
    const supplier = await this.usersRepository.findUserById(supplierId);

    if (!supplier || supplier.role !== 'Supplier') {
      throw new ForbiddenException('User is not a supplier.');
    }

    await this.productsRepository.disableProductsBySupplier(supplierId);
    return this.usersRepository.updateUserRole(supplierId, 'User');
  }

  // Yêu cầu chuyển thành Supplier
  async requestSupplierRole(userId: string) {
    const user = await this.usersRepository.findUserById(userId);

    if (!user || user.role !== 'User') {
      throw new ForbiddenException('Invalid user role.');
    }

    return this.usersRepository.updateUserRole(userId, 'PendingSupplier');
  }
}
