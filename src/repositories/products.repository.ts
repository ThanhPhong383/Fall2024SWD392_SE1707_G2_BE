import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/system/database/prisma.service';
import { CreateProductDto } from 'src/dto/products/create-product.dto';
import { UpdateProductDto } from 'src/dto/products/update-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(public readonly prismaService: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto, supplierId: string) {
    return this.prismaService.products.create({
      data: {
        ...createProductDto,
        supplierId,
        isAvailable: createProductDto.quantity > 0,
        quantity: createProductDto.quantity || 0,
      },
    });
  }
  // Vô hiệu hóa tất cả sản phẩm của nhà cung cấp (supplierId)
  async disableProductsBySupplier(supplierId: string) {
    return this.prismaService.products.updateMany({
      where: { supplierId },
      data: { isAvailable: false },
    });
  }
  async findAllProducts() {
    return this.prismaService.products.findMany();
  }

  async findProductById(id: number) {
    return this.prismaService.products.findUnique({ where: { id } });
  }

  async updateProductStock(productId: number, quantity: number) {
    return this.prismaService.products.update({
      where: { id: productId },
      data: { quantity },
    });
  }

  async updateProduct(id: number, updateProductDto: UpdateProductDto) {
    return this.prismaService.products.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async deleteProduct(id: number) {
    return this.prismaService.products.delete({ where: { id } });
  }

  async updateQuantity(id: number, quantity: number) {
    const isAvailable = quantity > 0;
    return this.prismaService.products.update({
      where: { id },
      data: { quantity, isAvailable },
    });
  }

  async findProductByName(name: string) {
    return this.prismaService.products.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
    });
  }

  async findOrdersByProduct(productId: number) {
    return this.prismaService.orderItem.findMany({ where: { productId } });
  }
}
