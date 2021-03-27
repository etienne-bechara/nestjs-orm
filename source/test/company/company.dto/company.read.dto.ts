import { IsOptional, IsString } from 'class-validator';

import { OrmPaginationDto } from '../../../orm/orm.dto';
import { CompanyEntity } from '../company.entity';

export class CompanyReadDto extends OrmPaginationDto {

  @IsOptional()
  @IsString()
  public name: string;

  @IsOptional()
  public parent: CompanyEntity;

}
