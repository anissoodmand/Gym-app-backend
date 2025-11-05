import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop() phone: string;
  @Prop() name: string;
  @Prop({ unique: true }) nationalId: string;
  @Prop() birthDate: Date;
  @Prop() fatherName: string;
  @Prop() address: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
