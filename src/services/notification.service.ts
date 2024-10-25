import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  async sendReminder(orderId: string, message: string) {
    console.log(`Reminder for Order ${orderId}: ${message}`);
  }

  async sendAlert(userId: string, message: string) {
    console.log(`Alert for User ${userId}: ${message}`);
  }
}
