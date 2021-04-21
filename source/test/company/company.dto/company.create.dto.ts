import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CompanyCreateDto {

  @IsString() @IsNotEmpty()
  public name: string;

  @IsNumber()
  public capital: number;

  @IsOptional()
  @IsUUID()
  public headquarter: string;

}
