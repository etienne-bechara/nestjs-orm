import { OrmQueryOrder } from '../orm.enum';

export interface OrmPagination<Entity> {
  sort: string;
  order: OrmQueryOrder;
  limit: number;
  offset: number;
  count: number;
  records: Entity[];
}
