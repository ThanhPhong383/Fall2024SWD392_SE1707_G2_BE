import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/system/database/prisma.service'; // Đảm bảo không có vòng lặp import

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo mới đơn hàng
  async createOrder(data: any) {
    return this.prisma.orders.create({ data });
  }

  // Tìm đơn hàng theo ID
  async findOrderById(id: string) {
    return this.prisma.orders.findUnique({
      where: { id },
    });
  }

  // Hủy đơn hàng
  async cancelOrder(id: string) {
    return this.prisma.orders.update({
      where: { id },
      data: { status: 'Canceled' },
    });
  }

  // Tìm các đơn hàng chưa đăng ký và quá hạn 24 giờ
  async findExpiredOrders() {
    const expiryDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 giờ trước
    return this.prisma.orders.findMany({
      where: {
        status: 'AwaitingRegistration',
        createdAt: { lte: expiryDate },
      },
    });
  }

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(id: string, status: string) {
    return this.prisma.orders.update({
      where: { id },
      data: { status },
    });
  }

  // Kiểm tra xem đơn hàng có thuộc về User không (để kiểm soát quyền truy cập)
  async isOrderOwnedByUser(orderId: string, userId: string): Promise<boolean> {
    const order = await this.prisma.orders.findFirst({
      where: { id: orderId, userId },
    });
    return !!order; // Trả về true nếu tìm thấy đơn hàng, ngược lại là false
  }

  // Kiểm tra trạng thái đơn hàng hiện tại
  async getOrderStatus(orderId: string): Promise<string | null> {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    return order ? order.status : null;
  }
}

export default OrderRepository;
