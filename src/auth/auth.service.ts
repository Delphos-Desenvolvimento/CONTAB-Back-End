import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

// Define the shape of the user data we'll return (without password)
export interface UserWithoutPassword {
  id: number;
  user: string;  // This is the email in your Admin model
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 10;
  
  // Access the Admin model through the PrismaService
  private get adminModel() {
    return (this.prismaService as any).admin;
  }

  constructor(private prismaService: PrismaService) {}

  async validateUser(email: string, password: string): Promise<UserWithoutPassword | null> {
    this.logger.log(`Validating user: ${email}`);
    
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      // Find user with case-insensitive email search
      const user = await this.adminModel.findFirst({
        where: {
          user: email.toLowerCase()
        }
      });
      
      if (!user) {
        this.logger.warn(`User not found: ${email}`);
        return null;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${email}`);
        return null;
      }

      // Return user data without password
      return {
        id: user.id,
        user: user.user,
        role: user.role || 'USER',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`, error.stack);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async createUser(email: string, password: string, role: string = 'USER') {
    try {
      // Validate required fields
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Sanitize and validate email
      const sanitizedEmail = email?.toString()?.trim()?.toLowerCase();
      if (!sanitizedEmail) {
        throw new Error('Email is required');
      }

      // Check if user already exists (case-insensitive)
      const existingUser = await this.prismaService.admin.findFirst({
        where: {
          user: sanitizedEmail
        }
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      // Sanitize and validate role
      const sanitizedRole = (role || 'USER').toString().toUpperCase();
      if (!['ADMIN', 'USER'].includes(sanitizedRole)) {
        throw new Error('Invalid role. Must be either ADMIN or USER');
      }

      // Create new user with the correct fields
      const newUser = await this.prismaService.admin.create({
        data: {
          user: sanitizedEmail,
          password: hashedPassword,
          role: sanitizedRole
        },
        select: {
          id: true,
          user: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      this.logger.log(`Created new user: ${sanitizedEmail}`);
      return newUser;
      
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const allUsers = await this.prismaService.admin.findMany({
        select: {
          id: true,
          user: true,
          role: true
        }
      });
      return allUsers;
    } catch (error) {
      this.logger.error(`Error fetching users: ${error.message}`, error.stack);
      throw error;
    }
  }
}
