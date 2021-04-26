import { IsOptional } from 'class-validator';

import { OrmPaginationDto } from '../../../orm/orm.dto';
import { CompanyEntity } from '../company.entity';

export class CompanyReadDto extends OrmPaginationDto {

  @IsOptional()
  public name: string;

  @IsOptional()
  public headquarter: CompanyEntity;

}
