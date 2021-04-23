import { FindOptions } from '@mikro-orm/core';

import { OrmQueryOrder } from '../orm.enum';

export interface OrmReadOptions<Entity> extends FindOptions<Entity> {
  sort?: string;
  order?: OrmQueryOrder;
  findOrFail?: boolean;
}
