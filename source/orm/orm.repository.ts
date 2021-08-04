import { EntityManager, EntityName } from '@mikro-orm/core';

import { OrmRepositoryOptions } from './orm.interface';
import { OrmDeleteRepository } from './orm.repository/orm.repository.delete';

export abstract class OrmRepository<T> extends OrmDeleteRepository<T> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<T>,
    protected readonly repositoryOptions: OrmRepositoryOptions<T> = { },
  ) {
    super(entityManager, entityName, repositoryOptions);
    this.repositoryOptions.entityName ??= 'entity';
  }

}
