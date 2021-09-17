import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from '@bechara/nestjs-core';

export class CompanyCreateDto {

  @IsString() @IsNotEmpty()
  public name: string;

  @IsNumber()
  public capital: number;

  @IsOptional()
  @IsUUID()
  public headquarter: string;

}
