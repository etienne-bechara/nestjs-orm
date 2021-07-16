import { Populate } from '@mikro-orm/core';

export interface OrmServiceOptions<Entity> {
  entityName?: string;
  primaryKey?: string;
  nestedPrimaryKeys?: string[];
  defaultPopulate?: Populate<Entity>;
  defaultUniqueKey?: (keyof Entity)[];
}
