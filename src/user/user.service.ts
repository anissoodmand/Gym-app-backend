import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { Profile } from '../auth/schemas/profile.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}

  private ensureObjectId(value: unknown): Types.ObjectId {
    if (value instanceof Types.ObjectId) {
      return value;
    }
    if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }
    throw new NotFoundException('شناسه کاربر نامعتبر است');
  }

  async getAllUsers() {
    const users = await this.userModel
      .find()
      .select('-passwordHash -refreshTokenHash')
      .exec();

    if (!users || users.length === 0) {
      throw new NotFoundException('هیچ کاربری یافت نشد');
    }

    // Get profiles for all users
    const userIds = users.map((user) => this.ensureObjectId(user._id));
    const profiles = await this.profileModel
      .find({ userId: { $in: userIds } })
      .select('userId name')
      .exec();

    // Create a map of userId to profile for quick lookup
    const profileMap = new Map<string, { name?: string | null }>();
    profiles.forEach((profileDoc) => {
      const profileUserId = this.ensureObjectId(
        profileDoc.userId,
      ).toHexString();
      profileMap.set(profileUserId, { name: profileDoc.name ?? null });
    });

    // Combine user data with profile data
    const usersWithProfiles = users.map((userDoc) => {
      const userObjectId = this.ensureObjectId(userDoc._id);
      const userId = userObjectId.toHexString();
      const profile = profileMap.get(userId);
      return {
        id: userId,
        name: profile?.name ?? null,
        phone: userDoc.phone,
        status: userDoc.status ?? 'active',
      };
    });

    return {
      success: true,
      total: usersWithProfiles.length,
      message: 'اطلاعات همه کاربران',
      users: usersWithProfiles,
    };
  }
}
