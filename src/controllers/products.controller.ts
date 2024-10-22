import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateProductDto } from 'src/dto/products/create-product.dto';
import { UpdateProductDto } from 'src/dto/products/update-product.dto';
import { ProductsService } from 'src/services/products.service';
import { AuthenticatedRequest } from 'src/types/express-request.interface';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    createProductDto.supplierId = req.user.userId; // Gắn supplierId từ user đã xác thực
    return await this.productsService.create(createProductDto);
  }

  @ApiResponse({
    status: 200,
    description: 'List of products retrieved successfully.',
  })
  @Get()
  async findAll() {
    return await this.productsService.findAll();
  }

  @ApiResponse({ status: 200, description: 'Product retrieved successfully.' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const product = await this.productsService.findOne(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.supplierId !== req.user.userId) {
      throw new ForbiddenException(
        'You are not allowed to update this product',
      );
    }

    return await this.productsService.update(id, updateProductDto);
  }

  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const product = await this.productsService.findOne(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.supplierId !== req.user.userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this product',
      );
    }

    return await this.productsService.remove(id);
  }
}
