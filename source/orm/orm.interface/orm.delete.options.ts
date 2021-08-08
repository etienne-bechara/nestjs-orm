import { Populate } from '@mikro-orm/core';

export interface OrmDeleteOptions<Entity> {
  disableFlush?: boolean;
  populate?: Populate<Entity>;
}
