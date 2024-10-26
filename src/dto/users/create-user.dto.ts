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
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsBoolean()
  isActive: boolean = true;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsPhoneNumber(undefined)
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  role: string = 'user';

  @IsString()
  password!: string;
}
