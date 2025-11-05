import { IsString, Length, IsOptional } from 'class-validator';

export class RegisterDto {
  // @IsPhoneNumber('IR')
  phone: string;

  @IsString()
  @Length(10, 10)
  nationalIdAsPassword: string;

  @IsString() fullname: string;
  @IsString() nationalId: string;
  @IsOptional() birthDate?: string;
  @IsOptional() fatherName?: string;
  @IsOptional() address?: string;
}
