import { IsOptional } from '@bechara/nestjs-core';

import { CompanyCreateDto } from './company.create.dto';

export class CompanyUpdateDto extends CompanyCreateDto {

  @IsOptional()
  public name: string;

  @IsOptional()
  public capital: number;

}
