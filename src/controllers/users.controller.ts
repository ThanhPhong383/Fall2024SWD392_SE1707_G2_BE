import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from 'src/services/users.service';
import { AdminGuard } from 'src/configs/auth/guards/admin.guard';
import { UserGuard } from 'src/configs/auth/guards/user.guard';
import { CreateUserDto } from 'src/dto/users/create-user.dto';
import { UpdateUserDto } from 'src/dto/users/update-user.dto';
import { AuthenticatedRequest } from 'src/types/express-request.interface';

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
  @UseGuards(AdminGuard)
  findAll() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  @UseGuards(UserGuard)
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    if (id !== userId && req.user.role !== 'Admin') {
      throw new ForbiddenException('Access denied!');
    }
    return this.usersService.findUserById(id);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('profile')
  @UseGuards(UserGuard)
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.userId;
    return this.usersService.update(userId, updateUserDto);
  }

  @Patch(':id/switch-to-user')
  @UseGuards(AdminGuard)
  switchToUser(@Param('id') supplierId: string) {
    return this.usersService.switchSupplierToUser(supplierId);
  }

  @Patch(':id/request-supplier')
  @UseGuards(UserGuard)
  requestSupplierRole(@Param('id') userId: string) {
    return this.usersService.requestSupplierRole(userId);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
