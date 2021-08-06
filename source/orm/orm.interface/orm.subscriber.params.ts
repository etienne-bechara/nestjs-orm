import { EventArgs } from '@mikro-orm/core';

export type OrmSubscriberParams<Entity> = EventArgs<Entity>;
