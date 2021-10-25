import { Populate } from '@mikro-orm/core';

export interface OrmUpsertOptions<Entity> {
  populate?: Populate<Entity>;
  uniqueKey?: (keyof Entity)[];
  disallowUpdate?: boolean;
  disallowRetry?: boolean;
}
