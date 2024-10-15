import { Uuid, Datetime, Email } from '../../system/validation-tags';
import { IsString, IsBoolean, IsOptional, IsPhoneNumber, IsDateString, IsUUID, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsUUID()
  id: Uuid;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsBoolean()
  isActive: boolean = true;

  @IsOptional()
  @IsPhoneNumber(null)
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Datetime;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  email: Email;
}