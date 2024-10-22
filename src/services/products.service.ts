import { Injectable, ForbiddenException } from '@nestjs/common';
import { ProductsRepository } from 'src/repositories/products.repository';
import { CreateProductDto } from 'src/dto/products/create-product.dto';
import { UpdateProductDto } from 'src/dto/products/update-product.dto';

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
    return this.productsRepository.findProductById(id);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    return this.productsRepository.updateProduct(id, updateProductDto);
  }

  async remove(id: string) {
    const hasActiveOrders = await this.hasActiveOrders(id);
    if (hasActiveOrders) {
      throw new ForbiddenException(
        'Cannot delete product with active or delivered orders.',
      );
    }
    return this.productsRepository.deleteProduct(id);
  }

  async hasActiveOrders(productId: string): Promise<boolean> {
    const orders =
      await this.productsRepository.prismaService.orderItem.findMany({
        where: {
          productId,
          order: { status: { in: ['Processing', 'Delivered'] } },
        },
      });
    return orders.length > 0;
  }

  async disableProductsBySupplier(supplierId: string) {
    return this.productsRepository.disableProductsBySupplier(supplierId);
  }
}
