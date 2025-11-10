import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './schemas/user.schema';
import { Profile } from './schemas/profile.schema';
import { jalaliToGregorian, isValidJalaliDate } from './utils/jalali-date.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
    private readonly jwtService: JwtService,
  ) {}

  private parseExpiresToSeconds(
    value: string | undefined,
    defaultSeconds: number,
  ): number {
    if (!value) return defaultSeconds;
    const trimmed = value.trim().toLowerCase();
    const num = parseInt(trimmed, 10);
    if (!Number.isFinite(num)) return defaultSeconds;
    if (trimmed.endsWith('m')) return num * 60;
    if (trimmed.endsWith('h')) return num * 60 * 60;
    if (trimmed.endsWith('d')) return num * 24 * 60 * 60;
    if (trimmed.endsWith('s')) return num;
    return num; // assume already in seconds
  }

  async register(dto: RegisterDto) {
    const exist = await this.userModel.findOne({ phone: dto.phone });
    if (exist) throw new BadRequestException('Phone number already registered');

    const nationalIdExists = await this.profileModel.findOne({
      nationalId: dto.nationalId,
    });
    if (nationalIdExists)
      throw new BadRequestException('این کد ملی قبلاً ثبت شده است');

    // Convert Jalali date to Gregorian for storage
    let birthDate: Date | undefined;
    if (dto.birthDate) {
      if (!isValidJalaliDate(dto.birthDate)) {
        throw new BadRequestException(
          'فرمت تاریخ تولد نامعتبر است. فرمت صحیح: YYYY/MM/DD (شمسی)',
        );
      }
      const gregorianDate = jalaliToGregorian(dto.birthDate);
      if (!gregorianDate) {
        throw new BadRequestException('تاریخ تولد نامعتبر است');
      }
      birthDate = gregorianDate;
    }

    const saltRounds = +(process.env.BCRYPT_SALT_ROUNDS ?? 10);
    const passwordHash = await bcrypt.hash(
      dto.nationalIdAsPassword,
      saltRounds,
    );

    const user = await this.userModel.create({
      phone: dto.phone,
      passwordHash,
    });

    await this.profileModel.create({
      userId: user._id,
      name: dto.name,
      nationalId: dto.nationalId,
      birthDate: birthDate,
      fatherName: dto.fatherName,
      address: dto.address,
    });

    const tokens = await this.generateTokens(user);
    return {
      success: true,
      message: 'ثبت نام کاربر با موفقیت انجام شد',
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ phone: dto.phone });
    if (!user) throw new UnauthorizedException('User not found');

    const match = await bcrypt.compare(dto.nationalId, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);
    return { success: true, message: 'شما وارد شدید ، خوش آمدید', ...tokens };
  }

  async generateTokens(user: User) {
    const payload = { sub: user._id, phone: user.phone, role: user.role };

    const accessExpiresInSeconds = this.parseExpiresToSeconds(
      process.env.JWT_ACCESS_EXPIRES,
      15 * 60,
    );
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'default_secret',
      expiresIn: accessExpiresInSeconds,
    });

    const refreshExpiresInSeconds = this.parseExpiresToSeconds(
      process.env.JWT_REFRESH_EXPIRES,
      7 * 24 * 60 * 60,
    );
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'default_secret',
      expiresIn: refreshExpiresInSeconds,
    });

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.userModel.updateOne(
      { _id: user._id },
      { refreshTokenHash: refreshHash },
    );

    return { accessToken, refreshToken };
  }

  async getMe(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-passwordHash -refreshTokenHash');
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const profile = await this.profileModel.findOne({ userId: user._id });

    return {
      id: user._id,
      name: profile?.name || null,
      phone: user.phone,
      status: (user as User & { status?: string }).status || 'active',
    };
  }
}
