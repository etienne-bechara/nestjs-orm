import { ModuleMetadata } from '@bechara/nestjs-core';

export interface SchemaAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<SchemaModuleOptions> | SchemaModuleOptions;
}

export interface SchemaModuleOptions {
  /**
   * Automatically syncs database schema on application initialization.
   */
  auto?: boolean;
  /**
   * Remove destructive statements when syncing schema.
   */
  safe?: boolean;
  /**
   * Exposes a controller for schema sync at `GET /schema/sync`.
   */
  controller?: boolean;
  /**
   * List of queries that should be ignored when syncing schema.
   */
  blacklist?: string[];
}
