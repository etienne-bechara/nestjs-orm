import { Populate } from '@mikro-orm/core';

export interface OrmDeleteOptions<Entity> {
  populate?: Populate<Entity>;
}
