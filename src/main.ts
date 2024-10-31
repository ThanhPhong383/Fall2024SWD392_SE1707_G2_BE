import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { config } from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './configs/auth/strategy/all-exceptions.filter';

config(); // Load environment variables

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Lấy HttpAdapterHost và sử dụng trong AllExceptionsFilter
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EduToy API Documentation')
    .setDescription('API documentation for the EduToy application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://fall2024-swd-392-se-1707-g2-fe.vercel.app',
    ],
    methods: 'GET, POST, PUT, PATCH, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
