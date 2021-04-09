import { ModuleMetadata } from '@bechara/nestjs-core';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';

export interface OrmAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  disableEntityScan?: boolean;
  entities?: any[];
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<OrmModuleOptions> | OrmModuleOptions;
}

export interface OrmModuleOptions {
  type: 'mongo' | 'mysql' | 'mariadb' | 'postgresql' | 'sqlite';
  host: string;
  port: number;
  username: string;
  password?: string;
  database?: string;
  schemaSync?: boolean;
  safeSync?: boolean;
  extras?: MikroOrmModuleOptions;
}