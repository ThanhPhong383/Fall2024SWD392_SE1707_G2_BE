import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateBuyOrderDto } from '../dto/order/create-buy-order.dto';
import { CreateRentOrderDto } from '../dto/order/create-rent-order.dto';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrderService } from 'src/services/order.service';

@ApiTags('Order')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('buy')
  @ApiBody({ type: CreateBuyOrderDto })
  @ApiResponse({ status: 201, description: 'Buy order successfully created.' })
  @ApiResponse({ status: 400, description: 'Cannot buy unavailable item.' })
  async createBuyOrder(@Body() createBuyOrderDto: CreateBuyOrderDto) {
    try {
      const order = await this.orderService.createBuyOrder(createBuyOrderDto);
      if (!createBuyOrderDto.userId) {
        await this.orderService.holdOrderForCustomer(order.id);
      }
      return {
        status: 201,
        data: order,
        message: 'Buy order successfully created.',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Unexpected error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('rent')
  @ApiBody({ type: CreateRentOrderDto })
  @ApiResponse({ status: 201, description: 'Rent order successfully created.' })
  @ApiResponse({ status: 400, description: 'Cannot rent unavailable item.' })
  async createRentOrder(@Body() createRentOrderDto: CreateRentOrderDto) {
    try {
      const order = await this.orderService.createRentOrder(createRentOrderDto);
      if (!createRentOrderDto.userId) {
        await this.orderService.holdOrderForCustomer(order.id);
      }
      return {
        status: 201,
        data: order,
        message: 'Rent order successfully created.',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Unexpected error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    try {
      const updatedOrder = await this.orderService.updateOrderStatus(
        id,
        status,
      );
      return { status: 200, data: updatedOrder };
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Unexpected error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
