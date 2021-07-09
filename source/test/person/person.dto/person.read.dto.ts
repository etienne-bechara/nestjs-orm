import { IsOptional } from '@bechara/nestjs-core';

import { OrmPaginationDto } from '../../../orm/orm.dto';

export class PersonReadDto extends OrmPaginationDto {

  @IsOptional()
  public name: string;

  @IsOptional()
  public age: number;

  @IsOptional()
  public height: number;

  @IsOptional()
  public weight: number;

}
