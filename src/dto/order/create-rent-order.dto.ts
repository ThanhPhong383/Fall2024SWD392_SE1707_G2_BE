/* eslint-disable prettier/prettier */
import { IsString, IsNumber } from 'class-validator';

export class CreateRentOrderDto 
{
  @IsString()
productId: string;
@IsNumber()

rentalDuration: number; // Thời gian thuê (ngày, tuần, hoặc tháng)
@IsNumber()

rentalPrice: number;
@IsNumber()

quantity: number;
@IsString()

userId: string;
}
