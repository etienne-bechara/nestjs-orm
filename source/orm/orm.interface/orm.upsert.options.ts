import { OrmUpdateOptions } from './orm.update.options';

export interface OrmUpsertOptions<Entity> extends OrmUpdateOptions<Entity> {
  uniqueKey?: string[];
  allowUpdate?: boolean;
  disableRetry?: boolean;
}
