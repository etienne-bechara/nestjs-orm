import { Populate } from '@mikro-orm/core';

export interface OrmDeleteOptions<Entity> {
  flush?: boolean;
  populate?: Populate<Entity>;
}
