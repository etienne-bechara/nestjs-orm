import { OrmReadOptions } from './orm.read.options';

export interface OrmUpsertOptions<Entity> extends OrmReadOptions<Entity> {
  uniqueKey?: string[];
  allowUpdate?: boolean;
  disallowRetry?: boolean;
}
