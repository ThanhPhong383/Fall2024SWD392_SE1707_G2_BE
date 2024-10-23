/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/system/database/prisma.service';
import { CreateProductDto } from 'src/dto/products/create-product.dto';
import { UpdateProductDto } from 'src/dto/products/update-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(public readonly prismaService: PrismaService) {}

  // Tạo sản phẩm mới cho supplier
  async createProduct(createProductDto: CreateProductDto, supplierId: string) {
    return this.prismaService.products.create({
      data: {
        ...createProductDto,
        supplierId,
        isAvailable: true,
      },
    });
  }

  // Lấy tất cả sản phẩm
  async findAllProducts() {
    return this.prismaService.products.findMany();
  }

  // Tìm sản phẩm theo ID
  async findProductById(id: string) {
    return this.prismaService.products.findUnique({ where: { id } });
  }

  // Cập nhật thông tin sản phẩm
  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    return this.prismaService.products.update({ where: { id }, data: updateProductDto });
  }

  // Xóa sản phẩm
  async deleteProduct(id: string) {
    return this.prismaService.products.delete({ where: { id } });
  }

  // Vô hiệu hóa tất cả sản phẩm của supplier
  async disableProductsBySupplier(supplierId: string) {
    return this.prismaService.products.updateMany({
      where: { supplierId },
      data: { isAvailable: false },
    });
  }
  async findProductByName(name: string) {
    return this.prismaService.products.findMany({
      where: {
        name: {
          contains: name, // Tìm kiếm theo từ khóa, không phân biệt hoa thường
          mode: 'insensitive',
        },
      },
    });
  }
}
