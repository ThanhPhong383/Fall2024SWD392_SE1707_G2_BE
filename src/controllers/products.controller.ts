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
  HttpException,
  HttpStatus,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../configs/auth/strategy/jwt-auth.guard';
import { ProductsService } from '../services/products.service';
import { AuthenticatedRequest } from '../types/express-request.interface';
import { Roles } from 'src/types/roles.enum';
import {
  ApiTags,
  ApiQuery,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new product (Supplier only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only suppliers allowed.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createProduct(
    @Body() productDto: any,
    @Req() req: AuthenticatedRequest,
  ) {
    const { userId, role } = req.user;

    // Kiểm tra vai trò, chỉ cho phép Supplier
    if (role !== Roles.Supplier) {
      throw new ForbiddenException('Only suppliers can create products.');
    }

    try {
      const product = await this.productsService.create(productDto, userId);
      return {
        statusCode: 201,
        message: 'Product created successfully.',
        data: product,
      };
    } catch (error) {
      console.error(`Error creating product: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to create product.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
  @ApiResponse({ status: 403, description: 'Unauthorized to update product.' })
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
  @ApiResponse({ status: 403, description: 'Unauthorized to delete product.' })
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

  @UseGuards(JwtAuthGuard)
  @Put(':id/quantity')
  @ApiResponse({ status: 200, description: 'Quantity updated successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async updateQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.productsService.updateQuantity(id, quantity);
  }

  @Get('search')
  @ApiQuery({
    name: 'name',
    required: true,
    description: 'Product name to search for.',
  })
  @ApiResponse({ status: 200, description: 'Product(s) found.' })
  @ApiResponse({
    status: 404,
    description: 'No products found with the given name.',
  })
  async searchProductByName(@Query('name') name: string) {
    const products = await this.productsService.findProductByName(name);
    if (products.length === 0) {
      throw new NotFoundException(`No products found matching "${name}".`);
    }
    return products;
  }
}
