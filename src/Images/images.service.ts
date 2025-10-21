import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImagesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { base64: string; altText?: string | null; url?: string | null }) {
    const db = this.prisma as unknown as { Img: { create: Function } };
    return db.Img.create({ data });
  }

  findAll() {
    const db = this.prisma as unknown as { Img: { findMany: Function } };
    return db.Img.findMany({ orderBy: { id: 'asc' } });
  }

  findOne(id: number) {
    const db = this.prisma as unknown as { Img: { findUnique: Function } };
    return db.Img.findUnique({ where: { id } });
  }

  remove(id: number) {
    const db = this.prisma as unknown as { Img: { delete: Function } };
    return db.Img.delete({ where: { id } });
  }
}
