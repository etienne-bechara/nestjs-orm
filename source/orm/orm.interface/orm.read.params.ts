import { EntityData, FilterQuery } from '@mikro-orm/core';

export type OrmReadParams<T> = string | number | FilterQuery<T> | EntityData<T>;
