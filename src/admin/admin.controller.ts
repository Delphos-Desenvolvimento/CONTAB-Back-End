import { Body, Controller, Get, Param, ParseIntPipe, Post, UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  async create(@Body() body: { user: string; password: string }) {
    console.log('Received user creation request:', { user: body.user });
    try {
      const user = await this.adminService.create(body);
      return { message: 'User created successfully', user };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Get()
  async findAll() {
    try {
      const users = await this.adminService.findAll();
      return { users };
    } catch (error) {
      throw new UnauthorizedException('Not authorized to view users');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.adminService.findOne(id);
      return { user };
    } catch (error) {
      throw new UnauthorizedException('Not authorized to view user');
    }
  }
}