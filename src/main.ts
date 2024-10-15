import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { config } from 'dotenv';
config(); // Correctly load environment variables
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description for the EduToy application')
    .setVersion('1.0') // Add the correct setVersion method
    .addBearerAuth() // Add Bearer Auth for security
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://fall2024-swd-392-se-1707-g2-fe.vercel.app',
    ],
    methods: 'GET, POST, PUT, PATCH, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}

bootstrap();
