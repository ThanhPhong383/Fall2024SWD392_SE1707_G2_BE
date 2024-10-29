import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from 'src/services/users.service';
import { AdminGuard } from 'src/configs/auth/guards/admin.guard';
import { UserGuard } from 'src/configs/auth/guards/user.guard';
import { UpdateUserDto } from 'src/dto/users/update-user.dto';
import { AuthenticatedRequest } from 'src/types/express-request.interface';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'All users retrieved successfully.',
  })
  @UseGuards(AdminGuard)
  findAll() {
    return this.usersService.findAllUsers();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by name' })
  @ApiResponse({ status: 200, description: 'Users found successfully.' })
  @ApiResponse({ status: 404, description: 'No users found.' })
  async searchByName(@Query('name') name: string) {
    const users = await this.usersService.findByName(name);
    if (!users || users.length === 0) {
      throw new HttpException('No users found.', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  @Get('profile')
  @ApiOperation({ summary: 'View personal profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
  @UseGuards(UserGuard)
  async viewProfile(@Req() req: AuthenticatedRequest) {
    const { userId } = req.user;
    return this.usersService.findUserById(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update personal profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  @UseGuards(UserGuard)
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Patch('profile/downgrade')
  @ApiOperation({ summary: 'Downgrade to User' })
  @ApiResponse({ status: 200, description: 'Downgraded to User successfully.' })
  @UseGuards(UserGuard)
  async downgradeToUser(@Req() req: AuthenticatedRequest) {
    const { userId } = req.user;
    const hasPendingOrders = await this.usersService.hasPendingOrders(userId);
    if (hasPendingOrders) {
      throw new HttpException(
        'Cannot downgrade with active orders.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersService.updateRole(userId, 'User');
  }

  @Patch('profile/upgrade')
  @ApiOperation({ summary: 'Upgrade to Supplier' })
  @ApiResponse({
    status: 200,
    description: 'Upgraded to Supplier successfully.',
  })
  @UseGuards(UserGuard)
  async upgradeToSupplier(@Req() req: AuthenticatedRequest) {
    const { userId } = req.user;
    return this.usersService.requestSupplierRole(userId);
  }

  @Patch(':id/upgrade-to-supplier')
  @ApiOperation({ summary: 'Admin upgrades user to Supplier' })
  @ApiResponse({
    status: 200,
    description: 'User upgraded to Supplier successfully.',
  })
  @UseGuards(AdminGuard)
  async upgradeToSupplierByAdmin(@Param('id') id: string) {
    return this.usersService.requestSupplierRole(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
