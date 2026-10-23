import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  genericName?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  strength?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  packSize?: string;

  @IsOptional()
  @IsNumber()
  mrp?: number;

  @IsOptional()
  @IsString()
  defaultDosage?: string;

  @IsOptional()
  @IsString()
  defaultDuration?: string;

  @IsOptional()
  @IsString()
  defaultFreq?: string;

  @IsOptional()
  @IsString()
  instruction?: string;
}
