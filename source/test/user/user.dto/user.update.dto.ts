import { IsOptional } from 'class-validator';

import { UserCreateDto } from './user.create.dto';

export class UserUpdateDto extends UserCreateDto {

  @IsOptional()
  public name: string;

  @IsOptional()
  public age: number;

  @IsOptional()
  public capital: number;

  @IsOptional()
  public preferences: Record<string, any>;

}
