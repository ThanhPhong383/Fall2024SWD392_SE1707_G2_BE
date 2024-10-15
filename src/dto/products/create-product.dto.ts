import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  category: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean = true;

  @IsString()
  supplierId: string; // Supplier or manufacturer reference
}
