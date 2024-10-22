/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from '../system/database/prisma.service';
import { AuthModule } from './auth.module';
import { UsersController } from 'src/controllers/users.controller';
import { UsersRepository } from 'src/repositories/users.repository'; // Import đúng
import { UsersService } from 'src/services/users.service';
import { ProductsRepository } from 'src/repositories/products.repository'; // Import thêm

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [
    UsersRepository, // Đảm bảo đăng ký UsersRepository
    ProductsRepository,
    PrismaService,
    UsersService,
  ],
  exports: [UsersRepository, ProductsRepository], // Export để sử dụng ở module khác
})
export class UsersModule {}
