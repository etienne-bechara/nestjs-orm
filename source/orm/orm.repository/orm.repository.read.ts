import { ConflictException, NotFoundException } from '@bechara/nestjs-core';
import { EntityManager, EntityName, FilterQuery } from '@mikro-orm/core';

import { OrmPagination } from '../orm.dto';
import { OrmQueryOrder } from '../orm.enum';
import { OrmReadArguments, OrmReadOptions, OrmReadParams, OrmRepositoryOptions } from '../orm.interface';
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
   * @param retries
   */
  public async readBy(
    params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { }, retries = 0,
  ): Promise<Entity[]> {
    if (!params || Array.isArray(params) && params.length === 0) return [ ];

    options.populate ??= this.repositoryOptions.defaultPopulate ?? false;
    let readEntities: Entity[];

    if (options.sort && options.order) {
      options.orderBy = { [options.sort]: options.order } as any;
    }

    try {
      readEntities = await this.entityManager.find(this.entityName, params, options);
      readEntities ??= [ ];
    }
    catch (e) {
      return OrmBaseRepository.handleException({
        caller: (retries) => this.readBy(params, options, retries),
        retries,
        error: e,
      });
    }

    if (!readEntities[0] && options.findOrFail) {
      throw new NotFoundException('entity does not exist');
    }

    return readEntities;
  }

  /**
   * Read a single entity by its ID.
   * @param id
   * @param options
   */
  public async readById(id: string | number, options: OrmReadOptions<Entity> = { }): Promise<Entity> {
    const pk = this.getPrimaryKey();
    const entities = await this.readBy({ [pk]: id } as unknown as Entity, options);
    return entities[0];
  }

  /**
   * Reads a single entity by its ID, fails if inexistent.
   * @param id
   * @param options
   */
  public async readByIdOrFail(
    id: string | number,
    options: Omit<OrmReadOptions<Entity>, 'findOrFail'> = { },
  ): Promise<Entity> {
    return this.readById(id, { ...options, findOrFail: true });
  }

  /**
   * Read a supposedly unique entity, throws an exception
   * if matching more than one.
   * @param params
   * @param options
   */
  public async readUnique(params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { }): Promise<Entity> {
    const entities = await this.readBy(params, options);

    if (entities.length > 1) {
      throw new ConflictException({
        message: 'unique constraint references more than one entity',
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
  public async readUniqueOrFail(
    params: OrmReadParams<Entity>,
    options: Omit<OrmReadOptions<Entity>, 'findOrFail'> = { },
  ): Promise<Entity> {
    return this.readUnique(params, { ...options, findOrFail: true });
  }

  /**
   * Count entities matching given criteria.
   * @param params
   * @param retries
   */
  public async countBy(params: OrmReadParams<Entity>, retries = 0): Promise<number> {
    if (!params || Array.isArray(params) && params.length === 0) return 0;
    let count: number;

    try {
      count = await this.entityManager.count(this.entityName, params);
    }
    catch (e) {
      return OrmBaseRepository.handleException({
        caller: (retries) => this.countBy(params, retries),
        retries,
        error: e,
      });
    }

    return count;
  }

  /**
   * Read and count all entities that matches given criteria.
   * Returns an object containing sort and order criteria,
   * limit, offset, count and records themselves.
   * @param params
   * @param options
   */
  public async readAndCountBy(
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
      count: await this.countBy(params),
      records: await this.readBy(params, options),
    };
  }

  /**
   * Given a record object (usually a http query), split properties
   * between read params and read options.
   * @param query
   */
  public getReadArguments(query: Record<string, any>): OrmReadArguments<Entity> {
    if (!query || typeof query !== 'object') return;

    const optionsProperties = new Set([ 'sort', 'order', 'limit', 'offset' ]);
    const params = { } as FilterQuery<Entity>;
    const options = { } as OrmReadOptions<Entity>;

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
