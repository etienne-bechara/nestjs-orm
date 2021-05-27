import { Populate } from '@mikro-orm/core';

export interface OrmServiceOptions<Entity> {
  defaultPopulate?: Populate<Entity>;
  defaultUniqueKey?: (keyof Entity)[];
}
