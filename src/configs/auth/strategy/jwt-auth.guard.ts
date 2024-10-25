/* eslint-disable prettier/prettier */
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('Token has expired. Please login again.');
    }
    if (err || !user) {
      throw new UnauthorizedException('Unauthorized access. Please provide a valid token.');
    }
    return user;
  }
}
