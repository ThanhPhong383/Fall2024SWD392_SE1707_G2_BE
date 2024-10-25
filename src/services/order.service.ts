import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateBuyOrderDto } from 'src/dto/order/create-buy-order.dto';
import { OrderRepository } from 'src/repositories/order.repository';
import { PrismaService } from 'src/system/database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createBuyOrder(createBuyOrderDto: CreateBuyOrderDto) {
    const product = await this.prisma.products.findUnique({
      where: { id: createBuyOrderDto.productId },
    });

    if (!product || product.quantity < createBuyOrderDto.quantity) {
      throw new HttpException(
        'Product is not available or insufficient stock.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const totalAmount = new Decimal(
      createBuyOrderDto.price * createBuyOrderDto.quantity,
    );

    const orderData = {
      userId: createBuyOrderDto.userId,
      totalAmount,
      status: createBuyOrderDto.userId ? 'Pending' : 'AwaitingRegistration',
    };

    const order = await this.orderRepository.createOrder(orderData);

    await this.prisma.products.update({
      where: { id: createBuyOrderDto.productId },
      data: { quantity: product.quantity - createBuyOrderDto.quantity },
    });

    return { message: 'Order created successfully.', order };
  }

  async updateOrderStatus(orderId: string, status: string, role: string) {
    const validStatusTransitions = {
      Pending: 'Processing',
      Processing: 'Delivered',
      Delivered: 'Received',
    };

    const currentOrder = await this.orderRepository.findOrderById(orderId);

    if (!currentOrder) {
      throw new HttpException('Order not found.', HttpStatus.NOT_FOUND);
    }

    const isAuthorized =
      (role === 'Supplier' && ['Pending', 'Processing'].includes(status)) ||
      (role === 'User' && status === 'Received');

    if (!isAuthorized) {
      throw new HttpException(
        'Unauthorized status update.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (validStatusTransitions[currentOrder.status] !== status) {
      throw new HttpException(
        'Invalid status transition.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.orders.update({
      where: { id: orderId },
      data: { status },
    });
  }

  async cancelUnregisteredOrders() {
    const expiredOrders = await this.prisma.orders.findMany({
      where: {
        status: 'AwaitingRegistration',
        createdAt: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        },
      },
    });

    for (const order of expiredOrders) {
      await this.orderRepository.cancelOrder(order.id);
      console.log(`Order ${order.id} canceled due to lack of registration.`);
    }
  }
}
