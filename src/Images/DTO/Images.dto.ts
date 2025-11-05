import { IsString, IsNotEmpty, IsOptional, IsArray, IsMimeType, IsUUID, IsNumber, IsDate } from 'class-validator';
import { Express } from 'express';
import 'multer';

export class UploadImageDto {
  @IsNotEmpty()
  file: any; // Using 'any' temporarily to avoid type issues

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateImageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class ImageResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  filename: string;

  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  mimetype?: string;

  @IsNumber()
  size: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  constructor(partial: Partial<ImageResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ImageListResponseDto {
  @IsArray()
  images: ImageResponseDto[];

  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;
}