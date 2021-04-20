import { ModuleMetadata } from '@bechara/nestjs-core';

export interface SyncAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<SyncModuleOptions> | SyncModuleOptions;
}

export interface SyncModuleOptions {
  enable?: boolean;
  safe?: boolean;
  blacklist?: string[];
}
