import { Datetime, Email } from '../../system/validation-tags';
import { IsString, IsBoolean, IsEmail, IsOptional, IsPhoneNumber, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsBoolean()
  isActive: boolean = true;

  @IsEmail()
  email: Email;

  @IsOptional()
  @IsPhoneNumber(null)
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Datetime;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  role: string = 'user';

  @IsString()
  password?: string;

  @IsDateString()
  createdDate: Datetime;
}