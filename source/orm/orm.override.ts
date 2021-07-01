import { EntityRepository as MongoEntityRepository } from '@mikro-orm/mongodb';
import { EntityRepository as MySqlEntityRepository } from '@mikro-orm/mysql';
import { EntityRepository as PostgreSqlEntityRepository } from '@mikro-orm/postgresql';

export * from '@mikro-orm/core';
export * from '@mikro-orm/nestjs';

export { MongoEntityRepository, MySqlEntityRepository, PostgreSqlEntityRepository };
