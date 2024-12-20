import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserGuard } from 'src/configs/auth/guards/user.guard';
import { RolesGuard } from 'src/configs/auth/guards/roles.guard';
import { Roles } from 'src/types/roles.enum';
import { LoginDto } from 'src/dto/auth/login.dto';
import { CreateUserDto } from 'src/dto/users/create-user.dto';
import { AuthService } from 'src/services/auth.service';
import { AuthenticatedRequest } from 'src/types/express-request.interface';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() CreateUserDto: CreateUserDto) {
    return this.authService.register(CreateUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(UserGuard)
  async logout(@Req() req: AuthenticatedRequest) {
    const { userId } = req.user;
    return this.authService.logout(userId);
  }

  @Post('refresh-token')
  @UseGuards(UserGuard, RolesGuard)
  @SetMetadata('roles', [Roles.User, Roles.Supplier])
  async refreshToken(@Req() req: AuthenticatedRequest) {
    const { userId } = req.user;
    const { refreshToken } = req.body;
    return this.authService.refreshToken(userId, refreshToken);
  }
}
