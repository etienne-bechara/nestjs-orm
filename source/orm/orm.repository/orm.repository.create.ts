import { EntityData, EntityManager, EntityName } from '@mikro-orm/core';

import { OrmCreateOptions, OrmRepositoryOptions } from '../orm.interface';
import { OrmReadRepository } from './orm.repository.read';

export abstract class OrmCreateRepository<Entity> extends OrmReadRepository<Entity> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Entity>,
    protected readonly repositoryOptions: OrmRepositoryOptions<Entity>,
  ) {
    super(entityManager, entityName, repositoryOptions);
  }

  /**
   * Create multiple entities based on provided data.
   * @param data
   * @param options
   */
  public async insert(data: EntityData<Entity>, options: OrmCreateOptions<Entity> = { }): Promise<Entity[]> {
    const { disableReload, disableFlush } = options;
    const dataArray = Array.isArray(data) ? data : [ data ];
    if (!data || dataArray.length === 0) return [ ];

    const newEntities = dataArray.map((d) => super.create(d));

    try {
      disableFlush
        ? this.persist(newEntities)
        : await this.persistAndFlush(newEntities);
    }
    catch (e) {
      this.handleException(e, newEntities);
    }

    const insertedEntities = disableReload
      ? newEntities
      : await this.reload(newEntities, options);

    return insertedEntities;
  }

  /**
   * Create a single entity based on provided data.
   * @param data
   * @param options
   */
  public async insertOne(data: EntityData<Entity>, options: OrmCreateOptions<Entity> = { }): Promise<Entity> {
    const [ insertedEntity ] = await this.insert(data, options);
    return insertedEntity;
  }

}
