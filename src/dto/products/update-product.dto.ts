import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  quantity?: number; // Thêm trường quantity

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  supplierId?: string;
}
