import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { user: string; password: string }) {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const looksHashed = data.password.startsWith('$2a$') || data.password.startsWith('$2b$') || data.password.startsWith('$2y$');
    const password = looksHashed ? data.password : await bcrypt.hash(data.password, saltRounds);
    const db = this.prisma as unknown as { admin: { create: Function; findMany: Function; findUnique: Function } };
    // Pre-check unique username
    const existing = await db.admin.findUnique({ where: { user: data.user } });
    if (existing) {
      throw new ConflictException('User already exists');
    }
    try {
      return await db.admin.create({ data: { ...data, password } });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('User already exists');
      }
      throw e;
    }
  }

  findAll() {
    const db = this.prisma as unknown as { admin: { findMany: Function } };
    return db.admin.findMany({ orderBy: { id: 'asc' } });
  }

  findOne(id: number) {
    const db = this.prisma as unknown as { admin: { findUnique: Function } };
    return db.admin.findUnique({ where: { id } });
  }
}
