import { OrmReadOptions } from './orm.read.options';
import { OrmReadParams } from './orm.read.params';

export interface OrmReadArguments<Entity> {
  params: OrmReadParams<Entity>;
  options: OrmReadOptions<Entity>;
}
