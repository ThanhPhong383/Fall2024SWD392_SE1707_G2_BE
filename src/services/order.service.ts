import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateBuyOrderDto } from 'src/dto/order/create-buy-order.dto';
import { OrderRepository } from 'src/repositories/order.repository';
import { PrismaService } from 'src/system/database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library'; // Import đúng Decimal từ Prisma

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

    // Sử dụng Decimal đã import đúng cách
    const totalAmount = new Decimal(
      createBuyOrderDto.price * createBuyOrderDto.quantity,
    );

    const orderData = {
      userId: createBuyOrderDto.userId,
      totalAmount,
      status: createBuyOrderDto.userId ? 'Pending' : 'AwaitingRegistration',
    };

    return this.orderRepository.createOrder(orderData);
  }

  // Lên lịch nhắc nhở người dùng tạo tài khoản
  async scheduleReminder(orderId: string) {
    setTimeout(
      async () => {
        const order = await this.orderRepository.findOrderById(orderId);
        if (order && order.status === 'AwaitingRegistration') {
          console.log(
            `Reminder: Please register to complete your order ${orderId}.`,
          );
        }
      },
      23 * 60 * 60 * 1000,
    ); // 1 tiếng trước khi hết 24 giờ
  }

  // Hủy đơn hàng nếu không tạo tài khoản trong 24 giờ
  async cancelUnregisteredOrders() {
    const expiredOrders = await this.prisma.orders.findMany({
      where: {
        status: 'AwaitingRegistration',
        createdAt: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    for (const order of expiredOrders) {
      await this.orderRepository.cancelOrder(order.id);
      console.log(
        `Order ${order.id} has been canceled due to no registration.`,
      );
    }
  }

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId: string, status: string) {
    const validStatuses = ['Pending', 'Processing', 'Delivered'];
    if (!validStatuses.includes(status)) {
      throw new HttpException('Invalid status update.', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.orders.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
