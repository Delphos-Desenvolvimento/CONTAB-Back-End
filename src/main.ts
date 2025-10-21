import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure JSON parsing with increased payload size limit for large base64 images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
    origin: ['http://localhost:5173'], // Permite requisições do frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Agent', 'X-Forwarded-For'],
    exposedHeaders: ['X-User-Agent', 'X-Forwarded-For']
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
