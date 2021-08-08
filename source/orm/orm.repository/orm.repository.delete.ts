import { EntityManager, EntityName } from '@mikro-orm/core';

import { OrmDeleteOptions, OrmRepositoryOptions } from '../orm.interface';
import { OrmUpdateRepository } from './orm.repository.update';

export abstract class OrmDeleteRepository<Entity> extends OrmUpdateRepository<Entity> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Entity>,
    protected readonly repositoryOptions: OrmRepositoryOptions<Entity>,
  ) {
    super(entityManager, entityName, repositoryOptions);
  }

  /**
   * Remove target entities and returns their reference.
   * @param entities
   * @param options
   */
  public async delete(entities: Entity | Entity[], options: OrmDeleteOptions<Entity> = { }): Promise<Entity[]> {
    const { disableFlush, populate } = options;
    const entityArray = Array.isArray(entities) ? entities : [ entities ];
    if (!entities || entityArray.length === 0) return [ ];

    if (populate) {
      await this.populate(entityArray, populate);
    }

    try {
      disableFlush
        ? this.remove(entityArray)
        : await this.removeAndFlush(entityArray);
    }
    catch (e) {
      this.handleException(e, entities);
    }

    return entityArray;
  }

  /**
   * Remove a single entity by its ID.
   * @param id
   * @param options
   */
  public async deleteById(id: string | number, options: OrmDeleteOptions<Entity> = { }): Promise<Entity> {
    const entity = await this.readByIdOrFail(id);
    await this.delete(entity, options);
    return entity;
  }

  /**
   * Remove a single entity.
   * @param entity
   * @param options
   */
  public async deleteOne(entity: Entity, options: OrmDeleteOptions<Entity> = { }): Promise<Entity> {
    const [ deletedEntity ] = await this.delete(entity, options);
    return deletedEntity;
  }

}
