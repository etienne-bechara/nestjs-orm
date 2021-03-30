import { IsOptional } from 'class-validator';

import { PersonCreateDto } from './person.create.dto';

export class PersonUpdateDto extends PersonCreateDto {

  @IsOptional()
  public name: string;

  @IsOptional()
  public age: number;

  @IsOptional()
  public height: number;

  @IsOptional()
  public weight: number;

  @IsOptional()
  public preferences: Record<string, any>;

}
