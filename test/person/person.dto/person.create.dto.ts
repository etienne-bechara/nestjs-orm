import { IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from '@bechara/nestjs-core';

export class PersonCreateDto {

  @IsString() @IsNotEmpty()
  public name: string;

  @IsString() @IsNotEmpty()
  public surname: string;

  @IsInt() @Min(0)
  public age: number;

  @IsNumber() @Min(0)
  public height: number;

  @IsNumber() @Min(0)
  public weight: number;

  @IsOptional()
  @IsObject()
  public preferences: Record<string, any>;

  @IsOptional()
  @IsString({ each: true })
  public employers: string[];

}
