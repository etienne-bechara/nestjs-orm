import { OrmReadOptions } from './orm.read.options';

export interface OrmCreateOptions<Entity> extends OrmReadOptions<Entity> {
  disableFlush?: boolean;
  disableReload?: boolean;
}
