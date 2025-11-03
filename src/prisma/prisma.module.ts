import { Global, Module, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      // The PrismaService now handles the connection in its onModuleInit
      // We don't need to call connect here as it's already handled by the service
      console.log('Prisma module initialized');
    } catch (error) {
      console.error('Failed to initialize Prisma module:', error);
      throw error;
    }
  }
}
