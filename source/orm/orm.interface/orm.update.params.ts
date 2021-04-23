import { EntityData } from '@mikro-orm/core';

export interface OrmUpdateParams<Entity> {
  entity: Entity;
  data: EntityData<Entity>;
}
