import { OrmUpdateOptions } from './orm.update.options';

export interface OrmUpsertOptions<Entity> extends OrmUpdateOptions<Entity> {
  uniqueKey?: (keyof Entity)[];
  allowUpdate?: boolean;
  disableRetry?: boolean;
}
