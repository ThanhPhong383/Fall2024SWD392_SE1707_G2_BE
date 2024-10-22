import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products.module';
import { DatabaseModule } from '../system/database/database.module';
import { UsersModule } from './users.module';
import { PrismaService } from '../system/database/prisma.service';
import { AuthModule } from './auth.module';
import { JwtStrategy } from '../configs/auth/strategy/jwt.strategy';
import { OrderModule } from './order.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(), // Định kỳ cho các tác vụ (như hủy đơn hàng)
    DatabaseModule,
    ProductsModule,
    UsersModule,
    AuthModule,
    OrderModule, // Đảm bảo OrderModule được import đầy đủ
  ],
  providers: [PrismaService, JwtStrategy],
  controllers: [],
})
export class AppModule {}
