/* eslint-disable prettier/prettier */
import { IsString, IsNumber } from 'class-validator';

export class CreateRentOrderDto {
  @IsString()
  productId!: string; // Non-null assertion

  @IsNumber()
  rentalDuration!: number; // Non-null assertion

  @IsNumber()
  rentalPrice!: number;

  @IsNumber()
  quantity!: number;

  @IsString()
  userId!: string;
}
