/* eslint-disable prettier/prettier */
import { Email } from '../../system/validation-tags';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: Email;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, { message: 'Password must be at most 20 characters long' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[!@#$%^&*])/, { message: 'Password must contain at least one special character (!@#$%^&*)' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'First name should not be empty' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name should not be empty' })
  lastName: string;
}