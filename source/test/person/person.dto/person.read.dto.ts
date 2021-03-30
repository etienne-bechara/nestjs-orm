import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { OrmPaginationDto } from '../../../orm/orm.dto';

export class PersonReadDto extends OrmPaginationDto {

  @IsOptional()
  @IsString() @IsNotEmpty()
  public name?: string;

  @IsOptional()
  @Transform((o) => Number.parseInt(o.value))
  @IsInt() @Min(0)
  public age?: number;

  @IsOptional()
  @Transform((o) => Number.parseInt(o.value))
  @IsNumber() @Min(0)
  public height?: number;

  @IsOptional()
  @Transform((o) => Number.parseInt(o.value))
  @IsNumber() @Min(0)
  public weight?: number;

}
