import { ConflictException, NotFoundException } from '@bechara/nestjs-core';
import { EntityData, EntityManager, EntityName, Populate } from '@mikro-orm/core';

import { OrmQueryOrder } from '../orm.enum';
import { OrmPagination, OrmReadArguments, OrmReadOptions, OrmReadParams, OrmRepositoryOptions } from '../orm.interface';
import { OrmBaseRepository } from './orm.repository.base';

export abstract class OrmReadRepository<Entity> extends OrmBaseRepository<Entity> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Entity>,
    protected readonly repositoryOptions: OrmRepositoryOptions<Entity>,
  ) {
    super(entityManager, entityName, repositoryOptions);
  }

  /**
   * Read entities matching given criteria, allowing pagination
   * and population options.
   * @param params
   * @param options
   */
  public async read(params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { }): Promise<Entity[]> {
    if (!params || Array.isArray(params) && params.length === 0) return [ ];

    options.populate ??= this.repositoryOptions.defaultPopulate ?? false;
    options.refresh = true;
    let readEntities: Entity[];

    if (options.sort && options.order) {
      options.orderBy = { [options.sort]: options.order };
    }

    try {
      // eslint-disable-next-line unicorn/no-array-method-this-argument
      readEntities = await this.find(params as EntityData<Entity>, options);
      readEntities ??= [ ];
    }
    catch (e) {
      this.handleException(e, readEntities);
    }

    if (!readEntities[0] && options.findOrFail) {
      throw new NotFoundException(`${this.repositoryOptions.entityName} does not exist`);
    }

    return readEntities;
  }

  /**
   * Count entities matching given criteria.
   * @param params
   */
  public async count(params: OrmReadParams<Entity>): Promise<number> {
    if (!params || Array.isArray(params) && params.length === 0) return 0;
    let count: number;

    try {
      count = await super.count(params as EntityData<Entity>);
    }
    catch (e) {
      this.handleException(e);
    }

    return count;
  }

  /**
   * Read a single entity by its ID.
   * @param id
   * @param options
   */
  public async readById(id: string | number, options: OrmReadOptions<Entity> = { }): Promise<Entity> {
    const pk = this.getPrimaryKey();
    const entities = await this.read({ [pk]: id }, options);
    return entities[0];
  }

  /**
   * Reads a single entity by its ID, fails if inexistent.
   * @param id
   * @param options
   */
  public async readByIdOrFail(id: string | number, options: OrmReadOptions<Entity> = { }): Promise<Entity> {
    options.findOrFail = true;
    return this.readById(id, options);
  }

  /**
   * Read a supposedly unique entity, throws an exception
   * if matching more than one.
   * @param params
   * @param options
   */
  public async readUnique(params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { }): Promise<Entity> {
    const entities = await this.read(params, options);

    if (entities.length > 1) {
      throw new ConflictException({
        message: `unique constraint references more than one ${this.repositoryOptions.entityName}`,
        params,
        entities,
      });
    }

    return entities[0];
  }

  /**
   * Read a supposedly unique entity, throws an exception
   * if matching more than one or if not found.
   * @param params
   * @param options
   */
  public async readUniqueOrFail(params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { }): Promise<Entity> {
    options.findOrFail = true;
    return this.readUnique(params, options);
  }

  /**
   * Read and count all entities that matches given criteria.
   * Returns an object containing sort and order criteria,
   * limit, offset, count and records themselves.
   * @param params
   * @param options
   */
  public async readAndCount(
    params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { },
  ): Promise<OrmPagination<Entity>> {
    options.sort ??= this.getPrimaryKey();
    options.order ??= OrmQueryOrder.ASC;
    options.limit ||= 100;
    options.offset ??= 0;

    return {
      sort: options.sort,
      order: options.order,
      limit: options.limit,
      offset: options.offset,
      count: await this.count(params),
      records: await this.read(params, options),
    };
  }

  /**
   * Execute ORM smart nested population on target entities,
   * ensures empty operations are not executed.
   * @param entities
   * @param populate
   */
  public async load(entities: Entity | Entity[], populate: Populate<Entity>): Promise<void> {
    if (!entities || Array.isArray(entities) && entities.length === 0) return;
    await super.populate(entities, populate);
  }

  /**
   * Update target entities according to configuration,
   * keeps original sorting.
   * @param entities
   * @param options
   */
  public async reload(entities: Entity[], options: OrmReadOptions<Entity> = { }): Promise<Entity[]> {
    const pk = this.getPrimaryKey();
    const entityIds = entities.map((e) => e[pk]);
    const orderedEntities: Entity[] = [ ];

    const reloadedEntities = await this.read(entityIds, options);

    for (const id of entityIds) {
      for (const [ index, entity ] of reloadedEntities.entries()) {
        if (entity[pk] === id) {
          orderedEntities.push(entity);
          reloadedEntities.splice(index, 1);
          continue;
        }
      }
    }

    return orderedEntities;
  }

  /**
   * Given a record object (usually a http query), split properties
   * between read params and read options.
   * @param query
   */
  public getReadArguments(query: any): OrmReadArguments<Entity> {
    if (!query || typeof query !== 'object') return;

    const optionsProperties = new Set([ 'sort', 'order', 'limit', 'offset' ]);
    const params = { };
    const options = { };

    for (const key in query) {
      if (optionsProperties.has(key)) {
        options[key] = query[key];
      }
      else {
        params[key] = query[key];
      }
    }

    return { options, params };
  }

}
