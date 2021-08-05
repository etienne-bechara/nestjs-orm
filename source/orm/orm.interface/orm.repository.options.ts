import { Populate } from '@mikro-orm/core';

export interface OrmRepositoryOptions<Entity> {
  displayName?: string;
  primaryKey?: string;
  nestedPrimaryKeys?: string[];
  defaultPopulate?: Populate<Entity>;
  defaultUniqueKey?: (keyof Entity)[];
}
