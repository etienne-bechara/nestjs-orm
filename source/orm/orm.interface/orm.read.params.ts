import { EntityData, FilterQuery } from '@mikro-orm/core';

export type OrmReadParams<T> = string | FilterQuery<T> | EntityData<T>;
