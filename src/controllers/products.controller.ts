import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../configs/auth/strategy/jwt-auth.guard';
import { ProductsService } from '../services/products.service';
import { AuthenticatedRequest } from '../types/express-request.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createProduct(
    @Body() productDto: any,
    @Req() req: AuthenticatedRequest,
  ) {
    const { userId } = req.user;
    return this.productsService.create(productDto, userId);
  }

  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() productDto: any,
    @Req() req: AuthenticatedRequest,
  ) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.supplierId !== req.user.userId) {
      throw new ForbiddenException('Unauthorized to update this product.');
    }
    return this.productsService.update(id, productDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeProduct(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.supplierId !== req.user.userId) {
      throw new ForbiddenException('Unauthorized to delete this product.');
    }
    return this.productsService.remove(id);
  }
}
