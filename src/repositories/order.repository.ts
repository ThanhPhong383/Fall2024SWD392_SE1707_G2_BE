/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { OrderItem, Orders } from 'prisma-client';
import { PrismaService } from 'src/system/database/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  async createOrder(orderData:  Omit<Orders, 'id' | 'createdAt' | 'updatedAt'>): Promise<Orders> {
    return this.prisma.orders.create({
      data: orderData,
    });
  }

  // Find all orders
  async findAllOrders(): Promise<Orders[]> {
    return this.prisma.orders.findMany();
  }

  // Find a single order by ID
  async findOrderById(id: string): Promise<Orders | null> {
    return this.prisma.orders.findUnique({
      where: { id },
    });
  }

  // Update an order
  async updateOrder(id: string, orderData: Orders): Promise<Orders> {
    return this.prisma.orders.update({
      where: { id },
      data: orderData,
    });
  }

  // Delete an order
  async deleteOrder(id: string): Promise<Orders> {
    return this.prisma.orders.delete({
      where: { id },
    });
  }

  // Create a new order item
  async createOrderItem(orderItemData: OrderItem): Promise<OrderItem> {
    return this.prisma.orderItem.create({
      data: orderItemData,
    });
  }

  // Find all order items
  async findAllOrderItems(): Promise<OrderItem[]> {
    return this.prisma.orderItem.findMany();
  }

  // Find a single order item by ID
  async findOrderItemById(id: string): Promise<OrderItem | null> {
    return this.prisma.orderItem.findUnique({
      where: { id },
    });
  }

  // Update an order item
  async updateOrderItem(id: string, orderItemData: Partial<Omit<OrderItem, 'id'>>): Promise<OrderItem> {
    return this.prisma.orderItem.update({
      where: { id },
      data: orderItemData,
    });
  }

  // Delete an order item
  async deleteOrderItem(id: string): Promise<OrderItem> {
    return this.prisma.orderItem.delete({
      where: { id },
    });
  }
}