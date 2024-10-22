import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderRepository } from 'src/repositories/order.repository';
import { ProductsRepository } from 'src/repositories/products.repository';

@Injectable()
export class RentalService {
  private readonly logger = new Logger(RentalService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productsRepository: ProductsRepository, // Ensure dependency is correctly injected
  ) {}

  // Cron Job chạy mỗi ngày lúc nửa đêm để kiểm tra đơn thuê hết hạn
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkRentals() {
    const now = new Date();
    const expiredRentals = await this.orderRepository.findExpiredRentals(now);

    for (const rental of expiredRentals) {
      if (rental.order) {
        await this.orderRepository.updateOrder(rental.orderId, {
          status: 'Completed',
        });
        await this.productsRepository.updateProduct(rental.productId, {
          isAvailable: true,
        });

        this.logger.log(
          `Rental with orderId ${rental.orderId} completed and product ${rental.productId} reactivated.`,
        );
      } else {
        this.logger.warn(
          `Order not found for rental item with ID ${rental.id}.`,
        );
      }
    }
  }
}
