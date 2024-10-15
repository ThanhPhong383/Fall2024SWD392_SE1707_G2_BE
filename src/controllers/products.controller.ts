import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';

import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateProductDto } from 'src/dto/products/create-product.dto';
import { UpdateProductDto } from 'src/dto/products/update-product.dto';
import { ProductsService } from 'src/services/products.service';

@ApiTags('Products') // Đặt tên "Products" cho nhóm API này
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @ApiResponse({
    status: 200,
    description: 'List of products retrieved successfully.',
  })
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @ApiResponse({ status: 200, description: 'Product retrieved successfully.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
