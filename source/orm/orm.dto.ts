import { IsArray, IsDefined, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min, ToNumber, ToStringArray } from '@bechara/nestjs-core';

import { OrmQueryOrder } from './orm.enum';

export class OrmPaginationDto {

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

  @IsOptional()
  @ToStringArray()
  @IsString({ each: true })
  public populate?: string[];

}

export class OrmPagination<Entity> {

  @IsString()
  public sort: string;

  @IsIn(Object.values(OrmQueryOrder))
  public order: OrmQueryOrder;

  @IsInt()
  public limit: number;

  @IsInt()
  public offset: number;

  @IsInt()
  public count: number;

  @IsArray()
  public records: Entity[];

}
