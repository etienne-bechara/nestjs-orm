import { Populate } from '@mikro-orm/core';

export interface OrmServiceOptions<T> {
  defaultPopulate?: Populate<T>;
  defaultUniqueKey?: string[];
}
