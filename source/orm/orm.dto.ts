import { IsDefined, IsIn, IsNumber, IsOptional, IsString, Max, Min, ToNumber } from '@bechara/nestjs-core';

import { OrmQueryOrder } from './orm.enum';

export abstract class OrmPaginationDto {

  @IsOptional()
  @IsString() @IsDefined()
  public sort?: string;

  @IsOptional()
  @IsIn(Object.values(OrmQueryOrder))
  public order?: string;

  @IsOptional()
  @ToNumber()
  @IsNumber() @Min(1) @Max(1000)
  public limit?: number;

  @IsOptional()
  @ToNumber()
  @IsNumber() @Min(0)
  public offset?: number;

}
