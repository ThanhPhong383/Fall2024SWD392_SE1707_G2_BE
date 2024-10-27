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

  // Tạo mới người dùng với kiểm tra email và băm mật khẩu
  async create(createUserDto: CreateUserDto): Promise<Users> {
    try {
      const { email, password, ...otherDetails } = createUserDto;

      // Kiểm tra email trùng lặp
      const existingUser = await this.usersRepository.findUserByEmail(email);
      if (existingUser) {
        throw new HttpException(
          'Email already exists!',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Băm mật khẩu với độ khó 10 vòng
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo mới người dùng với thông tin đã băm và các chi tiết khác
      const newUser = await this.usersRepository.createUser({
        ...otherDetails,
        email,
        password: hashedPassword,
        role: 'user', // Gán mặc định quyền 'user'
      });

      return newUser;
    } catch (error) {
      console.error(`Error creating user: ${(error as Error).message}`);
      throw new HttpException(
        'User creation failed.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // Lấy tất cả người dùng
  async findAllUsers() {
    return this.usersRepository.findAllUsers();
  }

  // Lấy người dùng theo ID
  async findUserById(id: string) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  // Cập nhật thông tin người dùng
  async update(id: string, updateUserDto: object) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return this.usersRepository.updateUser(id, updateUserDto);
  }
  // Hàm update vai trò người dùng
  async updateRole(userId: string, role: string) {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    return this.usersRepository.updateUserRole(userId, role);
  }
  // Xóa người dùng theo ID
  async remove(id: string) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return this.usersRepository.deleteUser(id);
  }

  // Chuyển Supplier thành User nếu không có đơn hàng đang xử lý
  async switchSupplierToUser(supplierId: string) {
    const supplier = await this.usersRepository.findUserById(supplierId);
    if (!supplier || supplier.role !== 'Supplier') {
      throw new ForbiddenException('User is not a supplier.');
    }

    const hasPendingOrders =
      await this.usersRepository.hasPendingOrders(supplierId);
    if (hasPendingOrders) {
      throw new ForbiddenException(
        'Supplier has pending orders and cannot be switched.',
      );
    }

    // Vô hiệu hóa tất cả sản phẩm của nhà cung cấp
    await this.disableProductsBySupplier(supplierId);

    // Cập nhật vai trò thành User
    return this.usersRepository.updateUserRole(supplierId, 'User');
  }

  // Yêu cầu chuyển người dùng thành Supplier
  async requestSupplierRole(userId: string) {
    const user = await this.usersRepository.findUserById(userId);
    if (!user || user.role !== 'User') {
      throw new ForbiddenException('Invalid user role.');
    }
    return this.usersRepository.updateUserRole(userId, 'PendingSupplier');
  }

  // Thăng cấp người dùng thành Admin
  async promoteToAdmin(userId: string) {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    return this.usersRepository.updateUserRole(userId, 'Admin');
  }

  // Kiểm tra xem người dùng có đơn hàng đang xử lý hay không
  async hasPendingOrders(userId: string): Promise<boolean> {
    return this.usersRepository.hasPendingOrders(userId);
  }

  // Vô hiệu hóa tất cả sản phẩm của nhà cung cấp
  async disableProductsBySupplier(supplierId: string) {
    const supplier = await this.usersRepository.findUserById(supplierId);
    if (!supplier || supplier.role !== 'Supplier') {
      throw new ForbiddenException('User is not a supplier.');
    }
    return this.productsRepository.disableProductsBySupplier(supplierId);
  }
}
