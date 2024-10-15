import { Email } from '../../system/validation-tags';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: Email;

  @IsString()
  password: string;
}
