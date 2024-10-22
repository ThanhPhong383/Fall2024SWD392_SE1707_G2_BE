import { Datetime, Email } from '../../system/validation-tags';
import {
  IsString,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName!: string; // Non-null assertion

  @IsString()
  lastName!: string;

  @IsBoolean()
  isActive: boolean = true;

  @IsEmail()
  email!: Email; // Non-null assertion vì email sẽ luôn được cung cấp

  @IsOptional()
  @IsPhoneNumber(undefined) // Thay null bằng undefined
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
  password!: string; // Non-null assertion vì bắt buộc

  @IsDateString()
  createdDate!: Datetime; // Non-null assertion vì luôn được gán
}
