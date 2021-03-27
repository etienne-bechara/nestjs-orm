import { QueryOrder } from '@mikro-orm/core';
import { Transform } from 'class-transformer';
import { IsDefined, IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export abstract class OrmPaginationDto {

  @IsOptional()
  @IsString() @IsDefined()
  public sort?: string;

  @IsOptional()
  @IsIn(Object.values(QueryOrder))
  public order?: string;

  @IsOptional()
  @Transform((o) => Number.parseInt(o.value))
  @IsNumber() @Min(1) @Max(1000)
  public limit?: number;

  @IsOptional()
  @Transform((o) => Number.parseInt(o.value))
  @IsNumber() @Min(0)
  public offset?: number;

}
