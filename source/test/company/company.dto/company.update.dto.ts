import { IsOptional } from 'class-validator';

import { CompanyCreateDto } from './company.create.dto';

export class CompanyUpdateDto extends CompanyCreateDto {

  @IsOptional()
  public name: string;

}
