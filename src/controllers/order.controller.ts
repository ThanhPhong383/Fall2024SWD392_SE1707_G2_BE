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
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrderService } from 'src/services/order.service';

@ApiTags('Order')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('buy')
  @ApiBody({ type: CreateBuyOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully.' })
  @ApiResponse({ status: 400, description: 'Product unavailable.' })
  async createBuyOrder(@Body() createBuyOrderDto: CreateBuyOrderDto) {
    try {
      const order = await this.orderService.createBuyOrder(createBuyOrderDto);

      if (!createBuyOrderDto.userId) {
        await this.orderService.scheduleReminder(order.id);
      }

      return { status: 201, data: order };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Unexpected error.',
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Unexpected error.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
