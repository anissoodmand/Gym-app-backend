import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Request as ExpressRequest, Response } from 'express';
import ms from 'ms';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    res.setHeader('Authorization', `Bearer ${result.accessToken}`);
    res.setHeader('X-Refresh-Token', result.refreshToken);
    res.setHeader(
      'Access-Control-Expose-Headers',
      'Authorization, X-Refresh-Token',
    );
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ms('7d'),
    });
    return {
      success: true,
      message: result.message ?? 'ثبت نام با موفقیت انجام شد',
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.setHeader('Authorization', `Bearer ${result.accessToken}`);
    res.setHeader('X-Refresh-Token', result.refreshToken);
    res.setHeader(
      'Access-Control-Expose-Headers',
      'Authorization, X-Refresh-Token',
    );
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: Number(ms('7d')),
    });
    return {
      success: true,
      message: result.message ?? 'ورود با موفقیت انجام شد',
    };
  }

  @Get('getMe')
  @UseGuards(JwtAuthGuard)
  async getMe(
    @Request()
    req: ExpressRequest & {
      user: { userId: string; phone: string; role: string };
    },
  ) {
    const user = await this.authService.getMe(req.user.userId);
    return {
      success: true,
      data: user,
    };
  }
}
