import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @IsString()
  @IsOptional()
  description!: string; // Description là optional

  @IsString()
  @IsNotEmpty()
  category!: string; // Category là bắt buộc

  @IsNumber()
  @Min(0, { message: 'Quantity must be 0 or more.' })
  @IsOptional()
  quantity!: number; // Thêm quantity, bắt buộc
}
