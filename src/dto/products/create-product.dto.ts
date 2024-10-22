import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string; // Non-null assertion

  @IsString()
  description!: string;

  @IsNumber()
  price!: number;

  @IsString()
  category!: string;

  @IsOptional()
  @IsBoolean()
  isAvailable: boolean = true; // Không dùng dấu `?`

  @IsString()
  supplierId!: string; // Non-null assertion nếu là bắt buộc
}
