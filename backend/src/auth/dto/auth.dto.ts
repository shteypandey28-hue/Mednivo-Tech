import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn, IsBoolean, IsNumber } from 'class-validator';

// Self-service sign-up may only pick these; ADMIN is assigned manually.
export const SELF_SERVICE_ROLES = ['DOCTOR', 'RECEPTIONIST'] as const;
export type SelfServiceRole = (typeof SELF_SERVICE_ROLES)[number];

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(SELF_SERVICE_ROLES)
  role?: SelfServiceRole;

  // Doctor-specific
  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  qualification?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(SELF_SERVICE_ROLES)
  role?: SelfServiceRole;

  @IsOptional()
  @IsBoolean()
  isOnboarded?: boolean;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  qualification?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  signature?: string;

  @IsOptional()
  @IsNumber()
  consultationFee?: number;

  @IsOptional()
  @IsString()
  bio?: string;
}
