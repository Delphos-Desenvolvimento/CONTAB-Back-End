import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

// Use require to import PrismaClient
const { PrismaClient } = require('@prisma/client');

// Define the shape of our Prisma client
interface CustomPrismaClient {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $on(event: 'query' | 'info' | 'warn' | 'error', callback: (e: any) => void): void;
  $executeRaw<T = any>(query: TemplateStringsArray | string, ...values: any[]): Promise<T>;
  $queryRaw<T = any>(query: TemplateStringsArray | string, ...values: any[]): Promise<T>;
  // Model types
  admin: any; // This will be used as this.prisma.admin
  admins: any; // This is the actual model name in the Prisma client
  [key: string]: any;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: CustomPrismaClient;
  private readonly logger = new Logger(PrismaService.name);
  
  constructor() {
    // Initialize Prisma client
    this.prisma = new PrismaClient({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'query', emit: 'event' },
      ],
    });

    // Log all queries
    this.prisma.$on('query', (e: any) => {
      this.logger.debug(`Query: ${e.query}`, `Params: ${e.params}`, `Duration: ${e.duration}ms`);
    });

    // Log all errors
    this.prisma.$on('error', (e: any) => {
      this.logger.error(`Database Error: ${e.message}`, e.stack);
    });
  }

  // Add $executeRaw with correct type
  $executeRaw<T = any>(query: TemplateStringsArray | string, ...values: any[]): Promise<T> {
    return (this.prisma as any).$executeRaw(query, ...values);
  }

  // Expose the Prisma client instance for advanced use cases
  get client() {
    return this.prisma;
  }

  async onModuleInit() {
    try {
      await this.prisma.$connect();
      this.logger.log('Successfully connected to the database');
    } catch (error: any) {
      this.logger.error('Failed to connect to the database', error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.prisma.$disconnect();
      this.logger.log('Successfully disconnected from the database');
    } catch (error: any) {
      this.logger.error('Error disconnecting from the database', error.stack);
      throw error;
    }
  }

  // Model accessors - using the correct model name from your schema
  get admin() {
    return (this.prisma as any).admin; // This matches the model name in your schema (Admin)
  }

  // Add custom methods for your models
  async clearDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear database in production');
    }
    
    // Get all model names from Prisma client
    const modelNames = Object.keys(this.prisma).filter(
      (key) => 
        !key.startsWith('$') && 
        key !== '_' &&
        typeof this.prisma[key]?.deleteMany === 'function'
    );

    // Delete all records from each model
    return Promise.all(
      modelNames.map((model) => this.prisma[model].deleteMany({}))
    );
  }
}
