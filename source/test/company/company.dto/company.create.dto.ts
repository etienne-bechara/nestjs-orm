import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CompanyCreateDto {

  @IsString() @IsNotEmpty()
  public name: string;

  @IsOptional()
  @IsUUID()
  public parent: string;

}
