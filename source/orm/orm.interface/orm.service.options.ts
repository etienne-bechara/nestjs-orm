import { Populate } from '@mikro-orm/core';

export interface OrmServiceOptions<Entity> {
  primaryKey?: string;
  nestedPrimaryKeys?: string[];
  defaultPopulate?: Populate<Entity>;
  defaultUniqueKey?: (keyof Entity)[];
}
