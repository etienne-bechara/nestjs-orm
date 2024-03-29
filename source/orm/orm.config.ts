import { AppEnvironment, Config, InjectConfig, IsBase64, IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString } from '@bechara/nestjs-core';

@Config()
export class OrmConfig {

  @IsOptional()
  @InjectConfig()
  @IsIn(Object.values(AppEnvironment))
  public readonly NODE_ENV: AppEnvironment;

  @IsOptional()
  @InjectConfig()
  @IsIn([ 'mongo', 'mysql', 'mariadb', 'postgresql', 'sqlite' ])
  public readonly ORM_TYPE: 'mongo' | 'mysql' | 'mariadb' | 'postgresql' | 'sqlite';

  @IsOptional()
  @InjectConfig()
  @IsString() @IsNotEmpty()
  public readonly ORM_HOST: string;

  @IsOptional()
  @InjectConfig()
  @IsNumberString()
  public readonly ORM_PORT: number;

  @IsOptional()
  @InjectConfig()
  @IsString() @IsNotEmpty()
  public readonly ORM_USERNAME: string;

  @IsOptional()
  @InjectConfig()
  @IsString() @IsNotEmpty()
  public readonly ORM_PASSWORD: string;

  @IsOptional()
  @InjectConfig()
  @IsString() @IsNotEmpty()
  public readonly ORM_DATABASE: string;

  @IsOptional()
  @InjectConfig()
  @IsBase64()
  public readonly ORM_SERVER_CA: string;

  @IsOptional()
  @InjectConfig()
  @IsBase64()
  public readonly ORM_CLIENT_CERTIFICATE: string;

  @IsOptional()
  @InjectConfig()
  @IsBase64()
  public readonly ORM_CLIENT_KEY: string;

}
