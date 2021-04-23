import { OrmUpdateOptions } from './orm.update.options';

export interface OrmUpsertOptions extends OrmUpdateOptions{
  uniqueKey?: string[];
  allowUpdate?: boolean;
  disableRetry?: boolean;
}
