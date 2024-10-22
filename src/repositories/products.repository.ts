import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/system/database/prisma.service';
import { CreateProductDto } from 'src/dto/products/create-product.dto';
import { UpdateProductDto } from 'src/dto/products/update-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto) {
    return this.prismaService.products.create({
      data: createProductDto,
    });
  }

  async findAllProducts() {
    return this.prismaService.products.findMany();
  }

  async findProductById(id: string) {
    return this.prismaService.products.findUnique({
      where: { id },
    });
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    return this.prismaService.products.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async deleteProduct(id: string) {
    return this.prismaService.products.delete({
      where: { id },
    });
  }

  // Vô hiệu hóa tất cả sản phẩm của một Supplier
  async disableProductsBySupplier(supplierId: string) {
    return this.prismaService.products.updateMany({
      where: { supplierId },
      data: { isAvailable: false },
    });
  }
}
