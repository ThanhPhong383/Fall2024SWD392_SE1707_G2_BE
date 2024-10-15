/* eslint-disable prettier/prettier */

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/services/users.service';
import { AdminGuard } from 'src/configs/auth/guards/admin.guard';
import { CreateUserDto } from 'src/dto/users/create-user.dto';
import { UserGuard } from 'src/configs/auth/guards/user.guard';
import { UpdateUserDto } from 'src/dto/users/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(UserGuard)
  findAll() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  @UseGuards(UserGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Put('change-password')
  @UseGuards(UserGuard)
  async changePassword(
    @Req() req,
    @Body() changePasswordDto,
  ) {
    const userId = req.user.userId;
    return this.usersService.changePassword(userId, changePasswordDto);
  }
}
