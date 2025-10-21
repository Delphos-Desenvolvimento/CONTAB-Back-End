import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImagesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { base64: string; altText?: string | null; url?: string | null }) {
    const db = this.prisma as unknown as { img: { create: Function } };
    return db.img.create({ data });
  }

  findAll() {
    const db = this.prisma as unknown as { img: { findMany: Function } };
    return db.img.findMany({ orderBy: { id: 'asc' } });
  }

  findOne(id: number) {
    const db = this.prisma as unknown as { img: { findUnique: Function } };
    return db.img.findUnique({ where: { id } });
  }

  remove(id: number) {
    const db = this.prisma as unknown as { img: { delete: Function } };
    return db.img.delete({ where: { id } });
  }
}
