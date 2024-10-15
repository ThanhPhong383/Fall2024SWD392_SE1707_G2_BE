import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products.module';
import { DatabaseModule } from '../system/database/database.module';
import { UsersModule } from './users.module';
import { PrismaService } from '../system/database/prisma.service';
import { AuthModule } from './auth.module';
import { JwtStrategy } from 'src/configs/auth/strategy/jwt.strategy';
import { OrderModule } from './order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
      envFilePath: '.env', // Path to the .env file
    }),
    DatabaseModule,
    ProductsModule, // Ensure ProductsModule is imported
    UsersModule,
    AuthModule,
    OrderModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [PrismaService, JwtStrategy],
  controllers: [],
})
export class AppModule {}
