/* eslint-disable unicorn/no-fn-reference-in-iterator */
import { BadRequestException, ConflictException, InternalServerErrorException,
  NotFoundException, NotImplementedException } from '@bechara/nestjs-core';
import { EntityData, EntityRepository, FilterQuery } from '@mikro-orm/core';

import { OrmQueryOrder } from './orm.enum';
import { OrmPaginatedResponse, OrmReadOptions, OrmReadParams,
  OrmServiceOptions, OrmUpsertOptions } from './orm.interface';

/**
 * Creates an abstract service tied with a repository.
 */
export abstract class OrmService<Entity> {

  public constructor(
    private readonly entityRepository: EntityRepository<Entity>,
    protected readonly serviceOptions: OrmServiceOptions<Entity> = { },
  ) { }

  /**
   * Returns provided unique key or default (whichever is valid).
   * @param uniqueKey
   */
  private getValidUniqueKey(uniqueKey: string[]): string[] {
    const defaultKey = this.serviceOptions.uniqueKey;
    let validKey: string[];

    if (Array.isArray(uniqueKey) && uniqueKey.length > 0) {
      validKey = uniqueKey;
    }

    if (!validKey && Array.isArray(defaultKey) && defaultKey.length > 0) {
      validKey = defaultKey;
    }

    if (!validKey) {
      throw new NotImplementedException('missing default unique key implementation');
    }

    return validKey;
  }

  /**
   * Wrapper responsible for all SELECT operations.
   * @param params
   * @param options
   */
  public async read(params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { }): Promise<Entity[]> {
    options.orderBy ??= { [options.sort]: options.order };
    options.populate ??= this.serviceOptions.populate;
    options.refresh = true;

    let entities: Entity[];

    if (typeof params === 'string') {
      params = { id: params };
    }

    try {
      entities = await this.entityRepository.find(params, options);
    }
    catch (e) {
      this.queryExceptionHandler(e, entities);
    }

    return Array.isArray(entities) ? entities : [ ];
  }

  /**
   * Wrapper responsible for all COUNT operations.
   * @param params
   */
  public async count(params: OrmReadParams<Entity>): Promise<number> {
    let count: number;

    try {
      count = await this.entityRepository.count(params as FilterQuery<Entity>);
    }
    catch (e) {
      this.queryExceptionHandler(e);
    }

    return count;
  }

  /**
   * Wrapper responsible for all INSERT operations.
   * @param data
   */
  public async create(data: EntityData<Entity>): Promise<Entity> {
    const newEntity = this.entityRepository.create(data);

    try {
      await this.entityRepository.persistAndFlush(newEntity);
    }
    catch (e) {
      this.queryExceptionHandler(e, newEntity);
    }

    return this.readById(newEntity['id']);
  }

  /**
   * Wrapper responsible for all UPDATE operations.
   * @param entity
   * @param data
   */
  public async update(entity: Entity, data: EntityData<Entity>): Promise<Entity> {
    const updatedEntity = this.entityRepository.assign(entity, data);

    try {
      await this.entityRepository.persistAndFlush(updatedEntity);
    }
    catch (e) {
      this.queryExceptionHandler(e, entity);
    }

    return this.readById(entity['id']);
  }

  /**
   * Wrapper responsible for all DELETE operations.
   * @param entity
   */
  public async remove(entity: Entity): Promise<Entity> {
    try {
      await this.entityRepository.removeAndFlush(entity);
    }
    catch (e) {
      this.queryExceptionHandler(e, entity);
    }

    return entity;
  }

  /**
   * Reads a single entity by its ID.
   * Obeys a custom default populate different than default.
   * @param id
   * @param options
   */
  public async readById(id: string, options: OrmReadOptions<Entity> = { }): Promise<Entity> {
    options.populate = options.populate || this.serviceOptions.populateById;
    const entity = await this.read(id, options);

    if (!entity[0]) {
      throw new NotFoundException('entity with given id does not exist');
    }

    return entity[0];
  }

  /**
   * Read a supposedly unique entity, if the constraint fails throw a conflict exception.
   * @param params
   * @param options
   */
  public async readUnique(params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { }): Promise<Entity> {
    const entities = await this.read(params, options);

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
   * Read and count all entities that matches given criteria.
   * Returns an object continuing limit, offset, count and results.
   * @param params
   * @param options
   */
  public async readAndCount(
    params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { },
  ): Promise<OrmPaginatedResponse<Entity>> {
    options.limit ||= 100;
    options.offset ||= 0;
    options.sort ??= 'updated';
    options.order ??= OrmQueryOrder.DESC;

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
   * Updates a singles entity by its id with plain data
   * and return the updated object.
   * @param id
   * @param data
   */
  public async updateById(id: string, data: EntityData<Entity>): Promise<Entity> {
    const target = await this.readById(id);
    return this.update(target, data);
  }

  /**
   * Read, create or update according to provided constraints.
   * @param data
   * @param options
   */
  public async readCreateOrUpdate(data: EntityData<Entity>, options: OrmUpsertOptions = { }): Promise<Entity> {
    const uniqueKey = this.getValidUniqueKey(options.uniqueKey);
    const clause = { };

    for (const key of uniqueKey) {
      clause[key] = data[key];
    }

    const matchingEntities = await this.read(clause);

    // Conflict (error)
    if (matchingEntities.length > 1) {
      throw new ConflictException({
        message: 'unique constraint references more than one entity',
        unique_key: uniqueKey,
        matches: matchingEntities.map((e) => e['id']),
      });
    }

    // Match (create or update)
    if (matchingEntities.length === 1) {
      return options.allowUpdate
        ? this.update(matchingEntities[0], data)
        : matchingEntities[0];
    }

    // Missing (create)
    try {
      const newEntity = await this.create(data);
      return newEntity;
    }
    catch (e) {
      if (options.disallowRetry) throw e;
      options.disallowRetry = true;
      return this.readCreateOrUpdate(data, options);
    }
  }

  /**
   * Based on incoming data and a unique key,
   * create a new entity or returns matching one.
   * @param data
   * @param uniqueKey
   */
  public async resert(data: EntityData<Entity>, uniqueKey?: string[]): Promise<Entity> {
    return this.readCreateOrUpdate(data, { uniqueKey });
  }

  /**
   * Based on incoming data and a unique key,
   * create a new entity or update matching one.
   * @param data
   * @param uniqueKey
   */
  public async upsert(data: EntityData<Entity>, uniqueKey?: string[]): Promise<Entity> {
    return this.readCreateOrUpdate(data, { uniqueKey, allowUpdate: true });
  }

  /**
   * Deletes a single entity by its id.
   * @param id
   */
  public async deleteById(id: string): Promise<Entity> {
    const entity = await this.readById(id);
    return this.remove(entity);
  }

  /**
   * Handles all query exceptions.
   * @param e
   * @param data
   */
  protected queryExceptionHandler(e: Error, data?: EntityData<Entity> | any): void {
    if (e.message.match(/duplicate entry/gi)) {
      const violation = /entry '(.+?)' for/gi.exec(e.message);
      throw new ConflictException({
        message: 'unique constraint violation',
        violation: violation ? violation[1] : null,
      });
    }

    if (e.message.match(/cannot add.+foreign key.+fails/gi)) {
      const violation = /references `(.+?)`/gi.exec(e.message);
      const constraint = violation ? violation[1] : 'undefined';
      throw new BadRequestException(`${constraint} must reference an existing entity`);
    }

    if (e.message.match(/cannot delete.+foreign key.+fails/gi)) {
      const violation = /\.`(.+?)`, constraint/gi.exec(e.message);
      const constraint = violation ? violation[1] : 'undefined';
      throw new ConflictException(`${constraint} constraint prevents cascade deletion`);
    }

    if (e.message.match(/query by not existing property/gi)) {
      const violation = /.+ (.+)/gi.exec(e.message);
      const constraint = violation ? violation[1] : 'undefined';
      throw new BadRequestException(`${constraint.replace('Entity', '').toLowerCase()} should not exist`);
    }

    throw new InternalServerErrorException({
      message: 'failed to execute query statement',
      query: e.message,
      data,
    });
  }

}
