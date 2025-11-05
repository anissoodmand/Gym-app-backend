import { IsString, Length } from 'class-validator';

export class LoginDto {
  // @IsPhoneNumber('IR')
  phone: string;
  @IsString()
  @Length(10, 10)
  nationalId: string;
}
