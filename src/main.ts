import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
