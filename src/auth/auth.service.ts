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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exist = await this.userModel.findOne({ phone: dto.phone });
    if (exist) throw new BadRequestException('Phone number already registered');

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
      birthDate: dto.birthDate,
      fatherName: dto.fatherName,
      address: dto.address,
    });

    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ phone: dto.phone });
    if (!user) throw new UnauthorizedException('User not found');

    const match = await bcrypt.compare(dto.nationalId, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async generateTokens(user: User) {
    const payload = { sub: user._id, phone: user.phone, roles: user.roles };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'default_secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    } as any);

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'default_secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    } as any);

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.userModel.updateOne(
      { _id: user._id },
      { refreshTokenHash: refreshHash },
    );

    return { accessToken, refreshToken };
  }
}
