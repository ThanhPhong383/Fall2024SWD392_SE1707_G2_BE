/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from '../system/database/prisma.service';
import { AuthModule } from './auth.module';
import { UsersController } from 'src/controllers/users.controller';
import { UsersRepository } from 'src/repositories/users.repository';
import { UsersService } from 'src/services/users.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    PrismaService,
    UsersService,
  ],
  exports: [UsersRepository],
})
export class UsersModule {}