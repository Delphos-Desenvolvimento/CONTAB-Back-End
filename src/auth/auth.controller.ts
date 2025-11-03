import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() credentials: { email: string; password: string }) {
    const { email, password } = credentials;
    
    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }
    
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    return { 
      message: 'Login successful', 
      user: {
        id: user.id,
        email: user.user,  // user.user contains the email
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
  }

  @Post('register')
  async register(@Body() userData: { email: string; password: string; role?: string }) {
    try {
      const { email, password, role } = userData;
      const user = await this.authService.createUser(email, password, role);
      return { 
        message: 'User created successfully', 
        user: {
          id: user.id,
          email: user.user,  // user.user contains the email
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
