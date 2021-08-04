import { IsOptional } from '@bechara/nestjs-core';

import { OrmPaginationDto } from '../../../orm/orm.dto';
import { Company } from '../company.entity';

export class CompanyReadDto extends OrmPaginationDto {

  @IsOptional()
  public name: string;

  @IsOptional()
  public headquarter: Company;

}
