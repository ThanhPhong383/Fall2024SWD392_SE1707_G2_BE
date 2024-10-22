import { Email } from '../../system/validation-tags';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email should not be empty' })
  email!: Email; // Non-null assertion

  @IsString()
  password!: string; // Non-null assertion
}
