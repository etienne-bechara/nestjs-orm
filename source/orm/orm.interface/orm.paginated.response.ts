import { QueryOrder } from '@mikro-orm/core';

export interface OrmPaginatedResponse<Entity> {
  sort: string;
  order: QueryOrder;
  limit: number;
  offset: number;
  count: number;
  records: Entity[];
}
