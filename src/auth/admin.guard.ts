import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    phone: string;
    role: string;
  };
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('دسترسی غیرمجاز: کاربر احراز هویت نشده است');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'دسترسی غیرمجاز: فقط مدیران می‌توانند به این بخش دسترسی داشته باشند',
      );
    }

    return true;
  }
}
