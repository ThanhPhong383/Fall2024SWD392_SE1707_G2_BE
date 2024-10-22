/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { OrderItem, Orders } from 'prisma-client';
import { PrismaService } from 'src/system/database/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo đơn hàng mới
  async createOrder(
    orderData: Omit<Orders, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Orders> {
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
  async updateOrder(
    id: string,
    orderData: Partial<Omit<Orders, 'id'>>,
  ): Promise<Orders> {
    return this.prisma.orders.update({ where: { id }, data: orderData });
  }

  // Xóa đơn hàng (cancelOrder bổ sung)
  async cancelOrder(id: string): Promise<Orders> {
    const order = await this.findOrderById(id);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'Pending')
      throw new Error('Only pending orders can be canceled');
    return this.prisma.orders.delete({ where: { id } });
  }

  // Tìm đơn thuê hết hạn
  async findExpiredRentals(now: Date) {
    return this.prisma.orderItem.findMany({
      where: {
        rentalReturnDate: { lte: now }, // Ngày trả nhỏ hơn hoặc bằng hiện tại
        isRental: true, // Kiểm tra sản phẩm thuê
        order: {
          status: { equals: 'Renting' }, // Sử dụng Prisma relation filter để kiểm tra trạng thái
        },
      },
      include: {
        order: true, // Bao gồm thông tin đơn hàng trong kết quả
      },
    });
  }
  // Tạo sản phẩm trong đơn hàng
  async createOrderItem(orderItemData: OrderItem): Promise<OrderItem> {
    return this.prisma.orderItem.create({ data: orderItemData });
  }

  // Lấy tất cả sản phẩm trong đơn hàng
  async findAllOrderItems(): Promise<OrderItem[]> {
    return this.prisma.orderItem.findMany();
  }

  // Tìm sản phẩm theo ID trong đơn hàng
  async findOrderItemById(id: string): Promise<OrderItem | null> {
    return this.prisma.orderItem.findUnique({ where: { id } });
  }

  // Cập nhật sản phẩm trong đơn hàng
  async updateOrderItem(
    id: string,
    orderItemData: Partial<Omit<OrderItem, 'id'>>,
  ): Promise<OrderItem> {
    return this.prisma.orderItem.update({ where: { id }, data: orderItemData });
  }

  // Xóa sản phẩm trong đơn hàng
  async deleteOrderItem(id: string): Promise<OrderItem> {
    return this.prisma.orderItem.delete({ where: { id } });
  }
}
