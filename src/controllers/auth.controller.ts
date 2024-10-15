import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserGuard } from 'src/configs/auth/guards/user.guard';
import { LoginDto } from 'src/dto/auth/login.dto';
import { RegisterDto } from 'src/dto/auth/register.dto';
import { AuthService } from 'src/services/auth.service';
import { AuthenticatedRequest } from 'src/types/express-request.interface';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(UserGuard)
  async logout(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.authService.logout(user['userId']);
  }

  @Post('refresh-token')
  @UseGuards(UserGuard)
  async refreshToken(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    const refreshToken = req.body.refreshToken;
    return this.authService.refreshToken(user['userId'], refreshToken);
  }
}
