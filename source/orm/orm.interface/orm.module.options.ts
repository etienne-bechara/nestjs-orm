import { ModuleMetadata } from '@bechara/nestjs-core';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';

import { SyncModuleOptions } from '../../sync/sync.interface';

export interface OrmAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  disableEntityScan?: boolean;
  entities?: any[];
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<OrmModuleOptions> | OrmModuleOptions;
}

export interface OrmModuleOptions extends MikroOrmModuleOptions {
  sync?: SyncModuleOptions;
}
