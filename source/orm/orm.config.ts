import { AppEnvironment, Injectable, InjectSecret, IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString } from '@bechara/nestjs-core';

@Injectable()
export class OrmConfig {

  @IsOptional()
  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @IsOptional()
  @InjectSecret()
  @IsIn([ 'mongo', 'mysql', 'mariadb', 'postgresql', 'sqlite' ])
  public readonly ORM_TYPE: 'mongo' | 'mysql' | 'mariadb' | 'postgresql' | 'sqlite';

  @IsOptional()
  @InjectSecret()
  @IsString() @IsNotEmpty()
  public readonly ORM_HOST: string;

  @IsOptional()
  @InjectSecret()
  @IsNumberString()
  public readonly ORM_PORT: number;

  @IsOptional()
  @InjectSecret()
  @IsString() @IsNotEmpty()
  public readonly ORM_USERNAME: string;

  @IsOptional()
  @InjectSecret()
  @IsString() @IsNotEmpty()
  public readonly ORM_PASSWORD: string;

  @IsOptional()
  @InjectSecret()
  @IsString() @IsNotEmpty()
  public readonly ORM_DATABASE: string;

}
