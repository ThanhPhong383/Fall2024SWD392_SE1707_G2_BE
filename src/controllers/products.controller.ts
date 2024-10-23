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
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../configs/auth/strategy/jwt-auth.guard';
import { ProductsService } from '../services/products.service';
import { AuthenticatedRequest } from '../types/express-request.interface';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Products') // Swagger API tag để nhóm các endpoint
@ApiBearerAuth() // Đánh dấu API này cần xác thực bằng Bearer token
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  async createProduct(
    @Body() productDto: any,
    @Req() req: AuthenticatedRequest,
  ) {
    const { userId } = req.user;
    return this.productsService.create(productDto, userId);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of all products.' })
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Product retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
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
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
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

  @Get('search')
  @ApiQuery({
    name: 'name',
    required: true,
    description: 'Product name to search for',
  })
  @ApiResponse({ status: 200, description: 'Product(s) found.' })
  @ApiResponse({
    status: 404,
    description: 'No products found with the given name.',
  })
  async searchProductByName(@Query('name') name: string) {
    if (!name) {
      throw new NotFoundException('Product name query is required');
    }
    const products = await this.productsService.findByName(name);
    if (products.length === 0) {
      throw new NotFoundException('No products found with the given name');
    }
    return products;
  }
}
