import { Injectable } from '@nestjs/common';
import { CreateProductDto } from 'src/dto/products/create-product.dto';
import { UpdateProductDto } from 'src/dto/products/update-product.dto';
import { ProductsRepository } from 'src/repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(createProductDto: CreateProductDto) {
    return this.productsRepository.createProduct(createProductDto);
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
    return this.productsRepository.deleteProduct(id);
  }
}
