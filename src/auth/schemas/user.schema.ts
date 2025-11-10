import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true, required: true })
  phone: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop()
  refreshTokenHash?: string;

  @Prop({ default: 'active' })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
