import { ModuleMetadata } from '@bechara/nestjs-core';
import { EntityData, EventArgs, FilterQuery, FindOptions, Populate } from '@mikro-orm/core';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';

import { SchemaModuleOptions } from '../schema/schema.interface';
import { OrmQueryOrder } from './orm.enum';

export type OrmReadParams<T> = FilterQuery<T>;

export type OrmSubscriberParams<Entity> = EventArgs<Entity>;

export interface OrmAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  disableEntityScan?: boolean;
  entities?: any[];
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<OrmModuleOptions> | OrmModuleOptions;
}

export interface OrmModuleOptions extends MikroOrmModuleOptions {
  sync?: SchemaModuleOptions;
}

export interface OrmExceptionHandlerParams {
  caller: (retries: number) => any;
  retries: number;
  error: Error;
}

export interface OrmSubscriberChangeset<Entity> {
  before?: EntityData<Entity>;
  after: EntityData<Entity>;
}

export interface OrmSubscriberOptions {
  entities: any | any[];
}

export interface OrmUpdateParams<Entity> {
  entity: Entity;
  data: EntityData<Entity>;
}

export interface OrmRepositoryOptions<Entity> {
  primaryKey?: string;
  nestedPrimaryKeys?: string[];
  defaultPopulate?: Populate<Entity>;
  defaultUniqueKey?: (keyof Entity)[];
}

export interface OrmReadArguments<Entity> {
  params: OrmReadParams<Entity>;
  options: OrmReadOptions<Entity>;
}

export interface OrmReadOptions<Entity> extends FindOptions<Entity, keyof Entity extends string ? keyof Entity : never> {
  sort?: string;
  order?: OrmQueryOrder;
  findOrFail?: boolean;
}

export interface OrmUpsertOptions<Entity> {
  populate?: Populate<Entity>;
  uniqueKey?: (keyof Entity)[];
  disallowUpdate?: boolean;
  disallowRetry?: boolean;
}

export interface OrmDeleteOptions<Entity> {
  populate?: Populate<Entity>;
}
