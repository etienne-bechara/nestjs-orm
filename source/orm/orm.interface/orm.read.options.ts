import { FindOptions, QueryOrder } from '@mikro-orm/core';

export interface OrmReadOptions<Entity> extends FindOptions<Entity> {
  sort?: string;
  order?: QueryOrder;
}
