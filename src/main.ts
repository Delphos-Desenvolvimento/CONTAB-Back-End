import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

// Load environment variables
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Get environment variables with defaults
  const port = parseInt(process.env.PORT || '3306', 10);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Configure JSON parsing with increased payload size limit for large base64 images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CORS Configuration
  const corsOptions = {
    origin: [
      frontendUrl,
      'http://localhost:5173', // Default Vite dev server
      'http://127.0.0.1:5173', // Alternative localhost
      'http://192.168.0.117:5173', // Local network access
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'X-User-Agent', 
      'X-Forwarded-For'
    ],
    exposedHeaders: [
      'Content-Length',
      'X-User-Agent', 
      'X-Forwarded-For'
    ]
  };

  app.enableCors(corsOptions);

  // Start the application
  await app.listen(port, '192.168.0.117'); // Listen on all network interfaces
  
  logger.log(`Application is running in ${nodeEnv} mode`);
  logger.log(`Listening on port ${port}`);
  logger.log(`Frontend URL: ${frontendUrl}`);
  logger.log(`CORS enabled for: ${corsOptions.origin.join(', ')}`);
}

bootstrap().catch(err => {
  console.error('Failed to start the application', err);
  process.exit(1);
});
