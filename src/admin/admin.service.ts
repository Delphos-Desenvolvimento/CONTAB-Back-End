import { ConflictException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const logger = new Logger('AdminService');

type Admin = {
  id: number;
  user: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

type AdminWithoutPassword = Omit<Admin, 'password'>;
type AdminCreateInput = Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>;
type AdminUpdateInput = Partial<Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>>;

type AdminWithRelations = {
  id: number;
  user: string;
  role: string;
  createdAt: Date;
  updatedAt?: Date;
};

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: { user: string; password: string; role?: string }): Promise<AdminWithRelations> {
    logger.log(`Creating new admin user: ${data.user}`);
    
    // Check if user already exists
    const existingUser = await this.prismaService.admin.findFirst({
      where: { 
        user: data.user.toLowerCase()
      }
    });

    if (existingUser) {
      logger.warn(`User ${data.user} already exists`);
      throw new ConflictException('Username already in use');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Prepare user data
    const userData: AdminCreateInput = {
      user: data.user.toLowerCase(),
      password: hashedPassword,
      role: data.role || 'admin',
    };
    
    // Create the user
    try {
const newUser = await this.prismaService.admin.create({
        data: userData,
        select: {
          id: true,
          user: true,
          role: true,
          createdAt: true
        }
      });
      
      logger.log(`User ${data.user} created successfully`);
      return newUser;
      
    } catch (error) {
      logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<AdminWithRelations[]> {
    logger.log('Fetching all admin users');
    try {
      const users = await this.prismaService.admin.findMany({
        select: {
          id: true,
          user: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return users;
    } catch (error) {
      logger.error('Error fetching admin users', error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<AdminWithRelations> {
    logger.log(`Fetching admin with ID: ${id}`);
    const user = await this.prismaService.admin.findUnique({
      where: { id },
      select: {
        id: true,
        user: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logger.warn(`Admin with ID ${id} not found`);
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, data: { user?: string; password?: string; role?: string }): Promise<AdminWithRelations> {
    logger.log(`Updating admin with ID: ${id}`);
    
    // Check if user exists
    const existingUser = await this.prismaService.admin.findUnique({
      where: { id }
    });

    if (!existingUser) {
      logger.warn(`Admin with ID ${id} not found for update`);
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    // Prepare update data
    const updateData: AdminUpdateInput = {};
    
    if (data.user && data.user !== existingUser.user) {
      // Check if new username is already taken (case-insensitive)
      const userExists = await this.findByUsername(data.user);

      if (userExists) {
        logger.warn(`Username ${data.user} is already taken`);
        throw new ConflictException('Username already in use');
      }
      updateData.user = data.user.toLowerCase();
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
      logger.debug(`Password updated for admin ID: ${id}`);
    }

    if (data.role) {
      updateData.role = data.role;
    }

    if (Object.keys(updateData).length === 0) {
      logger.warn('No valid fields provided for update');
      throw new Error('No valid fields provided for update');
    }

    try {
      const updatedUser = await this.prismaService.admin.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          user: true,
          role: true,
          updatedAt: true,
          createdAt: true
        }
      });

      logger.log(`Admin with ID ${id} updated successfully`);
      return updatedUser;
      
    } catch (error) {
      logger.error(`Error updating admin: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    logger.log(`Removing admin with ID: ${id}`);
    
    try {
      // First check if user exists
      const existingUser = await this.prismaService.admin.findUnique({
        where: { id },
        select: { id: true }
      });

      if (!existingUser) {
        logger.warn(`Admin with ID ${id} not found for removal`);
        throw new NotFoundException(`Admin with ID ${id} not found`);
      }

      // Delete the user
      await this.prismaService.admin.delete({
        where: { id }
      });

      logger.log(`Admin with ID ${id} removed successfully`);
      return;
      
    } catch (error) {
      logger.error(`Error removing admin: ${error.message}`, error.stack);
      throw error;
    }
  }

  async verifyUserCredentials(identifier: string, password: string): Promise<{
    id: number;
    user: string;
    role: string;
  } | null> {
    try {
const admin = await this.prismaService.admin.findFirst({
        where: {
          user: identifier,
        },
      });

      if (!admin) {
        logger.debug(`No admin found with username: ${identifier}`);
        return null;
      }

      logger.debug(`Found admin: ${admin.user} (ID: ${admin.id})`);
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      logger.debug(`Password ${isPasswordValid ? 'matches' : 'does not match'}`);
      
      if (!isPasswordValid) {
        return null;
      }
      
      return {
        id: admin.id,
        user: admin.user,
        role: admin.role || 'admin',
      };
    } catch (error) {
      logger.error('Error in verifyUserCredentials:', error);
      return null;
    }
  }

  async findByUsername(username: string): Promise<{ id: number; user: string; role: string } | null> {
    if (!username) {
      logger.warn('No username provided for search');
      return null;
    }

    logger.debug(`Looking for admin with username: '${username}'`);
    
    try {
      // Use Prisma's findFirst with select to only get the fields we need
const admin = await this.prismaService.admin.findFirst({
        where: {
          user: {
            equals: username.toLowerCase()
          }
        },
        select: {
          id: true,
          user: true,
          role: true
        }
      });
      
      if (admin) {
        // Ensure role has a default value if not set
        const adminWithDefaultRole = {
          ...admin,
          role: admin.role || 'admin'
        };
        
        logger.debug(`Admin found: ${adminWithDefaultRole.user} (ID: ${adminWithDefaultRole.id}, Role: ${adminWithDefaultRole.role})`);
        return adminWithDefaultRole;
      } else {
        logger.debug(`Admin not found with username: ${username}`);
        return null;
      }
    } catch (error) {
      logger.error('Error in findByUsername:', error);
      throw error;
    }
  }
}
