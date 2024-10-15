import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { config } from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

config(); // Load environment variables

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EduToy API Documentation')
    .setDescription('API documentation for the EduToy application')
    .setVersion('1.0')
    .addBearerAuth() // Add security for Bearer tokens
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Set up Swagger at the custom URL: /api-docs
  SwaggerModule.setup('api-docs', app, document);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000', // Local dev origin
      'https://fall2024-swd-392-se-1707-g2-fe.vercel.app', // Vercel frontend URL
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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
