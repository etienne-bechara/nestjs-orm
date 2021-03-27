import { ModuleMetadata } from '@nestjs/common';

export interface SchemaAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<SchemaModuleOptions> | SchemaModuleOptions;
}

export interface SchemaModuleOptions {
  schemaSync: boolean;
  safeSync: boolean;
}
