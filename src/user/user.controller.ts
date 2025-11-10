import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getAllUsers')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }
}
