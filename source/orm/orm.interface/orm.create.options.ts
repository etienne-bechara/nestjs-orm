import { OrmReadOptions } from './orm.read.options';

export interface OrmCreateOptions<Entity> extends OrmReadOptions<Entity> {
  disableReload?: boolean;
}
