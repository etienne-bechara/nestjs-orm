import { EntityData, EntityManager, EntityName } from '@mikro-orm/core';

import { OrmRepositoryOptions } from '../orm.interface';
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
   * Create multiple entities based on provided data, persist changes on next commit call.
   * @param data
   */
  public createFromAsync(data: EntityData<Entity> | EntityData<Entity>[]): Entity[] {
    const dataArray = Array.isArray(data) ? data : [ data ];
    if (!data || dataArray.length === 0) return [ ];

    const newEntities = dataArray.map((d) => this.entityManager.create(this.entityName, d));
    this.commitAsync(newEntities);

    return newEntities;
  }

  /**
   * Create multiple entities based on provided data.
   * @param data
   */
  public async createFrom(data: EntityData<Entity> | EntityData<Entity>[]): Promise<Entity[]> {
    const newEntities = this.createFromAsync(data);
    await this.commit();
    return newEntities;
  }

  /**
   * Create a single entity based on provided data, persist changes on next commit call.
   * @param data
   */
  public createOneAsync(data: EntityData<Entity>): Entity {
    const [ newEntity ] = this.createFromAsync(data);
    return newEntity;
  }

  /**
   * Create a single entity based on provided data, persist changes on next commit call.
   * @param data
   */
  public async createOne(data: EntityData<Entity>): Promise<Entity> {
    const newEntity = this.createOneAsync(data);
    await this.commit();
    return newEntity;
  }

}
