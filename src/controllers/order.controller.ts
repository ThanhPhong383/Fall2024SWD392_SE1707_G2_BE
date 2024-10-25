import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  Get,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from 'src/services/order.service';
import { CreateBuyOrderDto } from 'src/dto/order/create-buy-order.dto';
import { RolesGuard } from 'src/configs/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/configs/auth/strategy/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Orders') // Grouping APIs under 'Orders' in Swagger
@Controller('orders')
@UseGuards(JwtAuthGuard) // JWT authentication required for all endpoints
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('guest-order')
  @ApiOperation({ summary: 'Create order as guest' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Guest order created successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid product or insufficient stock.',
  })
  async createGuestOrder(@Body() createBuyOrderDto: CreateBuyOrderDto) {
    return this.orderService.createBuyOrder(createBuyOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order status successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status or unauthorized action.',
  })
  @UseGuards(RolesGuard) // Ensure only authorized roles can change status
  async updateStatus(
    @Param('id') orderId: string,
    @Body('status') status: string,
    @Body('role') role: string, // User or Supplier making the request
  ) {
    return this.orderService.updateOrderStatus(orderId, status, role);
  }

  @Get('cancel-expired')
  @ApiOperation({ summary: 'Cancel expired guest orders' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expired orders successfully canceled.',
  })
  async cancelExpiredOrders() {
    return this.orderService.cancelUnregisteredOrders();
  }
}
