import { Uuid, Datetime, Email } from '../../system/validation-tags';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsPhoneNumber,
  IsDateString,
  IsUUID,
  IsEmail,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsUUID()
  id?: Uuid; // Sử dụng dấu `?` thay vì `!` vì đây là tùy chọn

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsBoolean()
  isActive: boolean = true;

  @IsOptional()
  @IsPhoneNumber('VN') // Hoặc `undefined` nếu không yêu cầu mã quốc gia cụ thể
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Datetime;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  email?: Email; // Không cần `!` vì đã có `@IsOptional()`
}
