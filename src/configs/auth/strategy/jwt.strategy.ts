import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secretKey = process.env.JWT_SECRET || 'defaultSecret';
    console.log(`Secret Key being used for JWT Strategy: ${secretKey}`); // Log secret key being used

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  async validate(payload: any) {
    console.log('--- Start of JWT Payload Validation ---');
    console.log('Received JWT Payload:', payload); // Log the entire payload received for validation

    if (!payload) {
      console.warn('JWT payload is missing or empty');
      throw new UnauthorizedException('JWT payload is missing');
    }

    console.log('Checking for required fields in JWT payload...');
    const { userId, role, email } = payload;
    console.log(`userId: ${userId}, role: ${role}, email: ${email}`);

    // Kiểm tra nếu thiếu userId hoặc role
    if (!userId) {
      console.warn('Missing userId in JWT payload');
      throw new UnauthorizedException('Invalid JWT payload: Missing userId');
    }

    if (!role) {
      console.warn('Missing role in JWT payload');
      throw new UnauthorizedException('Invalid JWT payload: Missing role');
    }

    console.log('JWT payload contains all required fields');
    console.log('--- End of JWT Payload Validation ---');

    return {
      userId,
      email,
      role,
    };
  }
}
