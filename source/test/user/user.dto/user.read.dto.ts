import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { OrmPaginationDto } from '../../../orm/orm.dto';

export class UserReadDto extends OrmPaginationDto {

  @IsOptional()
  @IsString() @IsNotEmpty()
  public name?: string;

  @IsOptional()
  @Transform((o) => Number.parseInt(o.value))
  @IsNumber() @Min(0)
  public age?: number;

}
