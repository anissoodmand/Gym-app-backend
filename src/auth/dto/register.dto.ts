import { IsString, Length, IsOptional } from 'class-validator';
import { IsJalaliDate } from './validators/jalali-date.validator';

export class RegisterDto {
  @IsString()
  @Length(11, 11)
  phone: string;

  @IsString()
  @Length(10, 10)
  nationalIdAsPassword: string;

  @IsString() name: string;
  @IsString() nationalId: string;
  @IsOptional()
  @IsString()
  @IsJalaliDate()
  birthDate?: string;
  @IsOptional() fatherName?: string;
  @IsOptional() address?: string;
}
