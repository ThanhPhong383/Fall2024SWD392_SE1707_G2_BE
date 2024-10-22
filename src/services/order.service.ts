import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateBuyOrderDto } from 'src/dto/order/create-buy-order.dto';
import { CreateRentOrderDto } from 'src/dto/order/create-rent-order.dto';
import { OrderRepository } from 'src/repositories/order.repository';
import { Decimal } from 'prisma-client/runtime/library';
import { PrismaService } from 'src/system/database/prisma.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly prisma: PrismaService,
  ) {}

  // Tạo đơn hàng mua
  async createBuyOrder(createBuyOrderDto: CreateBuyOrderDto) {
    const product = await this.prisma.products.findUnique({
      where: { id: createBuyOrderDto.productId },
    });

    if (!product || !product.isAvailable) {
      throw new HttpException(
        'Product is not available for purchase.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const orderData = {
      userId: createBuyOrderDto.userId,
      totalAmount: new Decimal(
        createBuyOrderDto.price * createBuyOrderDto.quantity,
      ),
      status: 'Pending',
    };

    const createdOrder = await this.orderRepository.createOrder(orderData);
    await this.prisma.products.update({
      where: { id: createBuyOrderDto.productId },
      data: { isAvailable: false },
    });

    return createdOrder;
  }

  // Tạo đơn hàng thuê
  async createRentOrder(createRentOrderDto: CreateRentOrderDto) {
    const product = await this.prisma.products.findUnique({
      where: { id: createRentOrderDto.productId },
    });

    if (!product || !product.isAvailable) {
      throw new HttpException(
        'Product is not available for rent.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const order = {
      userId: createRentOrderDto.userId,
      totalAmount: new Decimal(
        createRentOrderDto.rentalPrice * createRentOrderDto.quantity,
      ),
      status: 'Renting',
    };

    const createdOrder = await this.orderRepository.createOrder(order);
    await this.prisma.products.update({
      where: { id: createRentOrderDto.productId },
      data: { isAvailable: false },
    });

    return createdOrder;
  }

  // Giữ đơn hàng trong 24 giờ
  async holdOrderForCustomer(orderId: string) {
    setTimeout(
      async () => {
        const order = await this.orderRepository.findOrderById(orderId);
        if (order && order.status === 'Pending') {
          await this.orderRepository.cancelOrder(orderId);
        }
      },
      24 * 60 * 60 * 1000,
    ); // 24 giờ
  }

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new HttpException('Order not found.', HttpStatus.NOT_FOUND);
    }

    if (['Processing', 'Delivered'].includes(order.status)) {
      throw new HttpException(
        'Cannot delete products from order.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!['Processing', 'Delivered'].includes(status)) {
      throw new HttpException('Invalid status update.', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.orders.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
