/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateBuyOrderDto } from 'src/dto/order/create-buy-order.dto';
import { CreateRentOrderDto } from 'src/dto/order/create-rent-order.dto';
import { OrderRepository } from 'src/repositories/order.repository';
import { Orders } from 'prisma-client';
import { Decimal } from 'prisma-client/runtime/library';
import { PrismaService } from 'src/system/database/prisma.service';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository,private prisma:PrismaService) { }

  async createBuyOrder(createBuyOrderDto: CreateBuyOrderDto): Promise<Orders> {
    // Check if the product is available (assuming you have a method to do this)
    const product = await this.prisma.products.findUnique({
      where: { id: createBuyOrderDto.productId },
    });
  
    if (!product || !product.isAvailable) {
      throw 'Product is not available for purchase.';
    }
  
    // Create the order
    const orderData = {
      userId: createBuyOrderDto.userId, // Assuming you have userId in the DTO
      totalAmount: new Decimal(createBuyOrderDto.price * createBuyOrderDto.quantity),
      status: 'Pending', // Set an initial status if needed
    };
  
    // Save the order
    const createdOrder = await this.orderRepository.createOrder(orderData);
  
    // Optionally update product availability
    await this.prisma.products.update({
      where: { id: createBuyOrderDto.productId },
      data: { isAvailable: false },
    });
  
    return createdOrder;
  }

  async createRentOrder(createRentOrderDto: CreateRentOrderDto): Promise<Orders> {
    // Check if the product is available
    const product = await this.prisma.products.findUnique({
      where: { id: createRentOrderDto.productId },
    });

    if (!product || !product.isAvailable) {
      throw new Error('Product is not available for reting.');
    
    }
    // Create the order
    const order = {
      userId: createRentOrderDto.userId, // Assuming you have userId in the DTO
      totalAmount: new Decimal(createRentOrderDto.rentalPrice * createRentOrderDto.quantity),
      status: 'Renting',
    };

    // Save the order first
    const createdOrder = await this.orderRepository.createOrder(order);

    // Update product availability
    await this.prisma.products.update({
      where: { id: createRentOrderDto.productId },
      data: { isAvailable: false },
    });

    // Handle any additional logic for rental orders, e.g., saving rental-specific data
    // You might want to create an OrderItem for this order

    return createdOrder;
  }
}

