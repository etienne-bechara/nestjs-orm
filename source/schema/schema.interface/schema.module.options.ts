import { ModuleMetadata } from '@bechara/nestjs-core';

export interface SchemaAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<SchemaModuleOptions> | SchemaModuleOptions;
}

export interface SchemaModuleOptions {
  schemaSync: boolean;
  safeSync: boolean;
}
