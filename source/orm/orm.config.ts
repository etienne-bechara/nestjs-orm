import { AppEnvironment, Injectable, InjectSecret } from '@bechara/nestjs-core';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@Injectable()
export class OrmConfig {

  @InjectSecret()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @InjectSecret()
  @IsIn([ 'mongo', 'mysql', 'mariadb', 'postgresql', 'sqlite' ])
  public readonly ORM_TYPE: 'mongo' | 'mysql' | 'mariadb' | 'postgresql' | 'sqlite';

  @InjectSecret()
  @IsString() @IsNotEmpty()
  public readonly ORM_HOST: string;

  @InjectSecret()
  @Transform((o) => Number.parseInt(o.value))
  @IsNumber()
  public readonly ORM_PORT: number;

  @InjectSecret()
  @IsString() @IsNotEmpty()
  public readonly ORM_USERNAME: string;

  @InjectSecret()
  @IsOptional()
  @IsString() @IsNotEmpty()
  public readonly ORM_PASSWORD: string;

  @InjectSecret()
  @IsString() @IsNotEmpty()
  public readonly ORM_DATABASE: string;

  @InjectSecret()
  @Transform((o) => o.value === 'true')
  public readonly ORM_SYNC_SCHEMA: boolean;

  @InjectSecret()
  @Transform((o) => o.value === 'true')
  public readonly ORM_SYNC_SAFE: boolean;

}
