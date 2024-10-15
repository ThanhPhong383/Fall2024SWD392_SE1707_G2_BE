/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcryptjs';
import { Users } from 'prisma-client';
import { apiFailed, apiSuccess } from 'src/dto/api-response';
import { ChangePasswordDto } from 'src/dto/users/change-password.dto';
import { CreateUserDto } from 'src/dto/users/create-user.dto';
import { UpdateUserDto } from 'src/dto/users/update-user.dto';
import { UsersRepository } from 'src/repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    try {
      if (!createUserDto?.email) {
        throw apiFailed(400, null, 'Email not found!');
      }
      const createdUser = await this.usersRepository.createUser({ ...createUserDto });
      return apiSuccess(201, createdUser, 'User create successfully.');
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw apiFailed(500, null, error.meta?.message || error.message);
    }
  }

  async findAllUsers() {
    try {
      const listUsers = await this.usersRepository.findAllUsers();
      return apiSuccess(200, listUsers, 'Find users successfully.');
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw apiFailed(500, null, error.meta?.message || error.message);
    }
  }

  async findUserById(id: string){
    try {
      const user = await this.usersRepository.findUserById(id);
      return apiSuccess(200, user, 'Find user successfully.');
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw apiFailed(500, null, error.meta?.message || error.message);
    }
  }

  async update(updateUserDto: UpdateUserDto) {
    const { id, email, ...updatedData } = updateUserDto;
    try {
      const existingUser = await this.usersRepository.findUserByEmail(email);

      if (existingUser && existingUser.id !== id) {
        throw apiFailed(400, null, 'Email existed!');
      }

      const updatedUserData = await this.usersRepository.updateUser(id, updatedData);

      return apiSuccess(200, updatedUserData, 'User update successfully.');
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw apiFailed(500, null, error.meta?.message || error.message);
    }
  }

  async remove(id: string): Promise<Users> {
    return this.usersRepository.deleteUser(id);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    try {
      const { oldPassword, newPassword } = changePasswordDto;
      const user = await this.usersRepository.findUserById(userId);
      if (!user) {
        throw apiFailed(400, null, 'User not found!');
      }

      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw apiFailed(400, null, 'Old password is incorrect!');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password in the database
      await this.usersRepository.updatePassword(userId, hashedNewPassword);

      return apiSuccess(200, null, 'Password changed successfully.');
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw apiFailed(500, null, error.meta?.message || error.message);
    }
  }
}