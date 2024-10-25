import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  async processPayment(orderId: string, amount: number): Promise<boolean> {
    console.log(`Processing payment for order ${orderId}, amount: ${amount}`);
    // Giả lập thanh toán thành công
    return true;
  }
}
