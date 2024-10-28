import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersRepository } from 'src/repositories/users.repository';
import { ProductsRepository } from 'src/repositories/products.repository';
import { CreateUserDto } from 'src/dto/users/create-user.dto';
import { Users } from 'prisma-client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Users> {
    const { email, password, ...otherDetails } = createUserDto;
    const existingUser = await this.usersRepository.findUserByEmail(email);
    if (existingUser) {
      throw new HttpException('Email already exists!', HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersRepository.createUser({
      ...otherDetails,
      email,
      password: hashedPassword,
      role: 'user',
    });
  }

  async findAllUsers() {
    return this.usersRepository.findAllUsers();
  }

  async findUserById(id: string) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  async findByName(name: string) {
    return this.usersRepository.findUsersByName(name);
  }

  async update(id: string, updateUserDto: object) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return this.usersRepository.updateUser(id, updateUserDto);
  }

  async updateRole(userId: string, role: string) {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    return this.usersRepository.updateUserRole(userId, role);
  }

  async requestSupplierRole(userId: string, isAdmin: boolean = false) {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    const hasPendingOrders =
      await this.usersRepository.hasPendingOrders(userId);
    if (hasPendingOrders) {
      throw new ForbiddenException('Cannot upgrade with active orders.');
    }
    const newRole = isAdmin ? 'Supplier' : 'PendingSupplier';
    return this.usersRepository.updateUserRole(userId, newRole);
  }

  async remove(id: string) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return this.usersRepository.deleteUser(id);
  }

  async hasPendingOrders(userId: string): Promise<boolean> {
    return this.usersRepository.hasPendingOrders(userId);
  }

  async disableProductsBySupplier(supplierId: string) {
    const supplier = await this.usersRepository.findUserById(supplierId);
    if (!supplier || supplier.role !== 'Supplier') {
      throw new ForbiddenException('User is not a supplier.');
    }
    return this.productsRepository.disableProductsBySupplier(supplierId);
  }
}
