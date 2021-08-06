import { EntityData } from '@mikro-orm/core';

export interface OrmSubscriberChangeset<Entity> {
  before?: EntityData<Entity>;
  after: EntityData<Entity>;
}
