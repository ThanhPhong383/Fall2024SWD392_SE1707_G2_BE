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
import { ApiTags, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Products') // Gắn tag cho Swagger
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new product' }) // Mô tả cho Swagger
  @ApiResponse({ status: 201, description: 'Product successfully created.' })
  async createProduct(
    @Body() productDto: any,
    @Req() req: AuthenticatedRequest,
  ) {
    const { userId } = req.user;
    return this.productsService.create(productDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all products' })
  @ApiResponse({ status: 200, description: 'List of all products.' })
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a product by ID' })
  @ApiResponse({ status: 200, description: 'Product found.' })
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
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiResponse({ status: 200, description: 'Product successfully updated.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 403, description: 'Unauthorized to update.' })
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
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiResponse({ status: 200, description: 'Product successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 403, description: 'Unauthorized to delete.' })
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
  @ApiOperation({ summary: 'Search products by name' }) // Swagger mô tả endpoint
  @ApiQuery({
    name: 'name',
    required: true,
    description: 'The name of the product to search for',
  }) // Định nghĩa query parameter cho Swagger
  @ApiResponse({ status: 200, description: 'Products found.' })
  @ApiResponse({ status: 404, description: 'No products found.' })
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
