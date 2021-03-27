/* eslint-disable @typescript-eslint/naming-convention */
import { AppEnvironment } from '@bechara/nestjs-core';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';

export interface OrmConfigOptions {
  NODE_ENV: AppEnvironment;
  ORM_TYPE: 'mongo' | 'mysql' | 'mariadb' | 'postgresql' | 'sqlite';
  ORM_HOST: string;
  ORM_PORT: number;
  ORM_USERNAME: string;
  ORM_PASSWORD: string;
  ORM_DATABASE: string;
  ORM_SYNC_SCHEMA: boolean;
  ORM_SYNC_SAFE: boolean;
  ORM_EXTRAS?: MikroOrmModuleOptions;
}
