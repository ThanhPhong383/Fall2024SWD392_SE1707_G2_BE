import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProductsRepository } from '../repositories/products.repository';
import { CreateProductDto } from '../dto/products/create-product.dto';
import { UpdateProductDto } from '../dto/products/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(createProductDto: CreateProductDto, supplierId: string) {
    return this.productsRepository.createProduct(createProductDto, supplierId);
  }

  async findAll() {
    return this.productsRepository.findAllProducts();
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productsRepository.findProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.productsRepository.updateProduct(id, updateProductDto);
  }

  async remove(id: string) {
    const hasActiveOrders = await this.hasActiveOrders(id);
    if (hasActiveOrders) {
      throw new ForbiddenException('Cannot delete product with active orders.');
    }
    return this.productsRepository.deleteProduct(id);
  }

  async updateQuantity(id: string, quantity: number) {
    const product = await this.productsRepository.findProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.productsRepository.updateQuantity(id, quantity);
  }

  private async hasActiveOrders(productId: string): Promise<boolean> {
    const orders = await this.productsRepository.findOrdersByProduct(productId);
    return orders.length > 0;
  }

  async findProductByName(name: string) {
    return this.productsRepository.findProductByName(name);
  }
}
