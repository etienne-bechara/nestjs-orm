import { IsDefined, IsIn, IsNumber, IsOptional, IsString, Max, Min, Transform } from '@bechara/nestjs-core';

import { OrmQueryOrder } from '../orm.enum';

export abstract class OrmPaginationDto {

  @IsOptional()
  @IsString() @IsDefined()
  public sort?: string;

  @IsOptional()
  @IsIn(Object.values(OrmQueryOrder))
  public order?: string;

  @IsOptional()
  @Transform((o) => Number(o.value), { toClassOnly: true })
  @IsNumber() @Min(1) @Max(1000)
  public limit?: number;

  @IsOptional()
  @Transform((o) => Number(o.value), { toClassOnly: true })
  @IsNumber() @Min(0)
  public offset?: number;

}
