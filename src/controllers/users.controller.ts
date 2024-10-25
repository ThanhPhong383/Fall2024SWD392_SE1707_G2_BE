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
  HttpException,
  HttpStatus,
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
import { CreateUserDto } from 'src/dto/users/create-user.dto';
import { UpdateUserDto } from 'src/dto/users/update-user.dto';
import { AuthenticatedRequest } from 'src/types/express-request.interface';

@ApiTags('Users') // Grouping for Swagger
@ApiBearerAuth() // JWT Authentication required
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('/')
  @ApiOperation({ summary: 'Root route for health check' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service is live!',
  })
  getRoot() {
    return { message: 'Welcome to the NestJS API! Your service is live 🎉' };
  }
  // Đăng ký từ Customer thành User
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'All users retrieved successfully.',
  })
  @UseGuards(AdminGuard) // Chỉ Admin được xem tất cả người dùng
  findAll() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details retrieved.' })
  @ApiResponse({ status: 403, description: 'Access denied.' })
  @UseGuards(UserGuard) // Chỉ người dùng hoặc Admin có thể xem chi tiết
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (id !== req.user.userId && req.user.role !== 'Admin') {
      throw new ForbiddenException('Access denied!');
    }
    return this.usersService.findUserById(id);
  }

  // Nâng cấp vai trò: Chỉ Admin
  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'User role updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid role transition.' })
  @UseGuards(AdminGuard)
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    if (!['Admin', 'Supplier'].includes(role)) {
      throw new HttpException(
        'Invalid role transition.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersService.updateRole(id, role);
  }

  // Supplier tự hạ cấp thành User nếu không có đơn hàng đang xử lý
  @Patch(':id/downgrade')
  @ApiOperation({ summary: 'Downgrade supplier to user' })
  @ApiResponse({ status: 200, description: 'Supplier downgraded to user.' })
  @ApiResponse({
    status: 400,
    description: 'Cannot downgrade with active orders.',
  })
  @UseGuards(UserGuard)
  async downgradeToUser(@Param('id') id: string) {
    const hasPendingOrders = await this.usersService.hasPendingOrders(id);
    if (hasPendingOrders) {
      throw new HttpException(
        'Cannot downgrade with active orders.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersService.updateRole(id, 'User');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @UseGuards(AdminGuard) // Chỉ Admin được phép cập nhật thông tin người dùng
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully.',
  })
  @UseGuards(UserGuard)
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @UseGuards(AdminGuard) // Chỉ Admin được phép xóa người dùng
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
