import { IsOptional } from '@bechara/nestjs-core';

import { OrmPaginationDto } from '../../../orm/orm.dto';

export class ContactReadDto extends OrmPaginationDto {

  @IsOptional()
  public person: string;

}
