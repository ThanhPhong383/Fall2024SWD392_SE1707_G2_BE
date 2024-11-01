import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    console.log('--- JwtAuthGuard Execution Started ---');
    console.log(
      'Token validation status:',
      info ? info.message : 'No issues with token',
    );

    if (info instanceof TokenExpiredError) {
      console.log('Token expired at:', info.expiredAt); // Log token expiration time
      throw new UnauthorizedException('Token has expired. Please login again.');
    }

    if (err) {
      console.log('Authentication error details:', err.message); // Log any error found
      throw new UnauthorizedException(
        'Authentication error. Please provide a valid token.',
      );
    }

    if (!user) {
      console.log('User not found in request after token validation.');
      throw new UnauthorizedException(
        'Unauthorized access. Please provide a valid token.',
      );
    }

    console.log(
      `User authenticated successfully with details: ${JSON.stringify(user)}`,
    );
    console.log('--- JwtAuthGuard Execution Completed ---');
    return user;
  }
}
