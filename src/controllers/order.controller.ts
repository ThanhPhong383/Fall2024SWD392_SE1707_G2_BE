/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { CreateBuyOrderDto } from '../dto/order/create-buy-order.dto';
import { CreateRentOrderDto } from '../dto/order/create-rent-order.dto';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrderService } from 'src/services/order.service';

@ApiTags('Order')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post('buy')
  @ApiBody({ type: CreateBuyOrderDto }) // Thêm mô tả Swagger cho dữ liệu gửi vào
  @ApiResponse({ status: 201, description: 'Buy order successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async createBuyOrder(@Body() createBuyOrderDto: CreateBuyOrderDto) {
    var a = false;
    await this.orderService.createBuyOrder(createBuyOrderDto).then(x=>{a=false;})
    .catch(x => {
      a = true;
    }
    ).finally(()=>{    console.log(a);

    
    })  ;
    if (!a) return { status: 201, description: 'Buy order successfully created.' };
    else return { status: 400, description: 'Cannot buy unavailable item.' };

  }

  @Post('rent')
  @ApiBody({ type: CreateRentOrderDto }) // Thêm mô tả Swagger cho dữ liệu gửi vào
  @ApiResponse({ status: 201, description: 'Rent order successfully created.' })
  @ApiResponse({ status: 400, description: 'Cannot rent unavailable item.' })
   async createRentOrder(@Body() createRentOrderDto: CreateRentOrderDto) {
    var a = false;
    await this.orderService.createRentOrder(createRentOrderDto).then(x=>{a=false;})
    .catch(x => {
      a = true;
    }
    ).finally(()=>{    console.log(a);

    
    })  ;
    if (!a) return { status: 201, description: 'Rent order successfully created.' };
    else return { status: 400, description: 'Cannot rent unavailable item.' };
  }
}
