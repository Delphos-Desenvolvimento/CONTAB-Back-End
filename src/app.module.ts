import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { ImagesModule } from './Images/images.module';

@Module({
  imports: [PrismaModule, AdminModule, ImagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
