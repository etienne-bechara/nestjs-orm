import { EventArgs, EventSubscriber } from '@mikro-orm/core';

export type OrmSubscriber<Entity> = EventSubscriber<Entity>;

export type OrmSubscriberParams<Entity> = EventArgs<Entity>;
