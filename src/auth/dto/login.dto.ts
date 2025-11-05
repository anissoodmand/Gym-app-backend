import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(11, 11)
  phone: string;
  @IsString()
  @Length(10, 10)
  nationalId: string;
}
