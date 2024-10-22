/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Orders } from 'prisma-client';
import { PrismaService } from 'src/system/database/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo đơn hàng mới
  async createOrder(orderData: Omit<Orders, 'id' | 'createdAt' | 'updatedAt'>): Promise<Orders> {
    return this.prisma.orders.create({ data: orderData });
  }

  // Lấy tất cả đơn hàng
  async findAllOrders(): Promise<Orders[]> {
    return this.prisma.orders.findMany();
  }

  // Tìm đơn hàng theo ID
  async findOrderById(id: string): Promise<Orders | null> {
    return this.prisma.orders.findUnique({ where: { id } });
  }

  // Cập nhật đơn hàng
  async updateOrder(id: string, orderData: Partial<Omit<Orders, 'id'>>): Promise<Orders> {
    return this.prisma.orders.update({ where: { id }, data: orderData });
  }

  // Hủy đơn hàng nếu đang chờ xử lý
  async cancelOrder(id: string): Promise<Orders> {
    const order = await this.findOrderById(id);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'Pending') throw new Error('Only pending orders can be canceled');
    return this.prisma.orders.delete({ where: { id } });
  }
}
