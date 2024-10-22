import { Module } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { OrderController } from '../controllers/order.controller';
import { OrderRepository } from '../repositories/order.repository';
import { PrismaService } from 'src/system/database/prisma.service';

@Module({
  providers: [OrderService, OrderRepository, PrismaService],
  controllers: [OrderController],
  exports: [OrderRepository], // Export OrderRepository để dùng trong RentalService
})
export class OrderModule {}
