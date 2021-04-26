import { IsOptional } from 'class-validator';

import { OrmPaginationDto } from '../../../orm/orm.dto';

export class ContactReadDto extends OrmPaginationDto {

  @IsOptional()
  public person: string;

}
