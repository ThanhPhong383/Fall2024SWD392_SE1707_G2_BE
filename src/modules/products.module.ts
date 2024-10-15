import { Module } from '@nestjs/common';
import { PrismaService } from '../system/database/prisma.service'; // Make sure PrismaService is injected properly
import { ProductsController } from 'src/controllers/products.controller';
import { ProductsRepository } from 'src/repositories/products.repository';
import { ProductsService } from 'src/services/products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, PrismaService],
})
export class ProductsModule {}
