import { Module } from '@nestjs/common';
import { PrismaService } from '../system/database/prisma.service';
import { ProductsController } from '../controllers/products.controller';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductsService } from '../services/products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, PrismaService],
  exports: [ProductsRepository],
})
export class ProductsModule {}
