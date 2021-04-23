/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable unicorn/no-fn-reference-in-iterator */
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException, NotImplementedException } from '@bechara/nestjs-core';
import { AnyEntity, EntityRepository, FilterQuery } from '@mikro-orm/core';

import { OrmQueryOrder } from './orm.enum';
import { OrmPaginatedResponse, OrmReadOptions, OrmReadParams, OrmServiceOptions, OrmUpsertOptions } from './orm.interface';

/**
 * Creates an abstract service tied with a repository.
 */
export abstract class OrmService<Entity> {

  public constructor(
    private readonly entityRepository: EntityRepository<Entity>,
    protected readonly serviceOptions: OrmServiceOptions<Entity> = { },
  ) { }

  /**
   * Wrapper responsible for all SELECT operations.
   * @param params
   * @param options
   */
  public async read(params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { }): Promise<Entity[]> {
    options.populate ??= this.serviceOptions.populate;
    options.refresh = true;
    let entities: Entity[];

    if (options.sort && options.order) {
      options.orderBy = { [options.sort]: options.order };
    }

    const findParams = typeof params === 'string'
      ? { id: params }
      : params;

    try {
      entities = await this.entityRepository.find(findParams, options);
      entities ??= [ ];
    }
    catch (e) {
      this.queryExceptionHandler(e, entities);
    }

    if (!entities[0] && options.findOrFail) {
      const entityError = typeof params === 'string' ? 'id' : 'params';
      throw new NotFoundException(`entity with given ${entityError} does not exist`);
    }

    return entities;
  }

  /**
   * Wrapper responsible for all COUNT operations.
   * @param options
   */
  public async count(options: OrmReadParams<Entity>): Promise<number> {
    let count: number;

    try {
      count = await this.entityRepository.count(options as FilterQuery<Entity>);
    }
    catch (e) {
      this.queryExceptionHandler(e);
    }

    return count;
  }

  /**
   * Reads a single entity by its ID.
   * Obeys a custom default populate different than default.
   * @param id
   * @param options
   */
  public async readById(id: string, options: OrmReadOptions<Entity> = { }): Promise<Entity> {
    options.populate = options.populate || this.serviceOptions.populateById;
    const entities = await this.read(id, options);
    return entities[0];
  }

  /**
   * Reads a single entity by its ID, fails if inexistent.
   * @param id
   * @param options
   */
  public async readByIdOrFail(id: string, options: OrmReadOptions<Entity> = { }): Promise<Entity> {
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
        message: 'unique constraint references more than one entity',
        params,
        entities,
      });
    }

    return entities[0];
  }

  /**
   * Read a supposedly unique entity, throws an exception
   * if not found or if matches more than one.
   * @param params
   * @param options
   */
  public async readUniqueOrFail(
    params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { },
  ): Promise<Entity> {
    options.findOrFail = true;
    return this.readUnique(params, options);
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
    options.sort ??= 'updated';
    options.order ??= OrmQueryOrder.DESC;
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
   * Wrapper responsible for all INSERT operations.
   * @param data
   * @param options
   */
  public async create(data: AnyEntity<Entity>): Promise<Entity>
  public async create(data: AnyEntity<Entity>[]): Promise<Entity[]>
  public async create(data: AnyEntity<Entity> | AnyEntity<Entity>[]): Promise<Entity | Entity[]> {
    const dataArray = Array.isArray(data) ? data : [ data ];
    const newEntities = dataArray.map((d) => this.entityRepository.create(d));

    try {
      await this.entityRepository.persistAndFlush(newEntities);
    }
    catch (e) {
      this.queryExceptionHandler(e, newEntities);
    }

    return Array.isArray(data) ? newEntities : newEntities[0];
  }

  /**
   * Wrapper responsible for all UPDATE operations.
   * @param entities
   * @param data
   * @param options
   */
  public async update(entity: Entity, data: AnyEntity<Entity>): Promise<Entity>;
  public async update(entities: Entity[], data: AnyEntity<Entity>[]): Promise<Entity[]>;
  public async update(
    entities: Entity | Entity[], data: AnyEntity<Entity> | AnyEntity<Entity>[],
  ): Promise<Entity| Entity[]> {
    const entityArray = Array.isArray(entities) ? entities : [ entities ];
    const dataArray = Array.isArray(data) ? data : [ data ];
    const updatedEntities = entityArray.map((e, i) => this.entityRepository.assign(e, dataArray[i]));

    if (entityArray.length !== dataArray.length) {
      throw new InternalServerErrorException({
        message: 'failed to map entities to update data',
        entityArray,
        dataArray,
      });
    }

    try {
      await this.entityRepository.persistAndFlush(updatedEntities);
    }
    catch (e) {
      this.queryExceptionHandler(e, entities);
    }

    return Array.isArray(entities) ? updatedEntities : updatedEntities[0];
  }

  /**
   * Updates a singles entity by its id with plain data
   * and return the updated object.
   * @param id
   * @param data
   */
  public async updateById(id: string, data: AnyEntity<Entity>): Promise<Entity> {
    const target = await this.readById(id);
    return this.update(target, data);
  }

  /**
   * Read, create or update according to provided constraints.
   * @param data
   * @param options
   */
  private async readCreateOrUpdate(data: AnyEntity<Entity>, options?: OrmUpsertOptions): Promise<Entity>;
  private async readCreateOrUpdate(data: AnyEntity<Entity>[], options?: OrmUpsertOptions): Promise<Entity[]>;
  private async readCreateOrUpdate(
    data: AnyEntity<Entity> | AnyEntity<Entity>[], options: OrmUpsertOptions = { },
  ): Promise<Entity | Entity[]> {
    const uniqueKey = this.getValidUniqueKey(options.uniqueKey);
    const dataArray = Array.isArray(data) ? data : [ data ];
    const resultMap: { index: number; target: 'read' | 'create' | 'update' }[] = [ ];

    const existingEntities: Entity[] = [ ];
    const updateTargets: Entity[] = [ ];
    const updateData: AnyEntity<Entity>[] = [ ];
    const createData: AnyEntity<Entity>[] = [ ];

    for (const dataItem of dataArray) {
      const populate = [ ];
      const clause = { };

      // Create clause (based on unique key) and population (based on many-to-many)
      for (const key of uniqueKey) clause[key] = dataItem[key];
      for (const key in dataItem) Array.isArray(dataItem[key]) ? populate.push(key) : undefined;
      const matchingEntities = await this.read(clause, { populate });

      // Conflict (error)
      if (matchingEntities.length > 1) {
        throw new ConflictException({
          message: 'unique constraint references more than one entity',
          uniqueKey,
          matches: matchingEntities.map((e) => e['id']),
        });
      }

      // Match (create or update)
      if (matchingEntities.length === 1) {
        if (options.allowUpdate) {
          resultMap.push({ index: updateTargets.length, target: 'update' });
          updateTargets.push(matchingEntities[0]);
          updateData.push(dataItem);
        }
        else {
          resultMap.push({ index: existingEntities.length, target: 'read' });
          existingEntities.push(matchingEntities[0]);
        }
      }
      // Missing (create)
      else {
        resultMap.push({ index: createData.length, target: 'create' });
        createData.push(dataItem);
      }
    }

    // Allow a single retry to handle concurrent creation
    let createdEntities: Entity[];

    try {
      createdEntities = await this.create(createData);
    }
    catch (e) {
      if (options.disallowRetry) throw e;
      options.disallowRetry = true;
      return this.readCreateOrUpdate(data as any, options);
    }

    const updatedEntities = await this.update(updateTargets, updateData);

    const resultEntities = resultMap.map((i) => {
      switch (i.target) {
        case 'read': return existingEntities[i.index];
        case 'create': return createdEntities[i.index];
        case 'update': return updatedEntities[i.index];
      }
    });

    return Array.isArray(data) ? resultEntities : resultEntities[0];
  }

  /**
   * Based on incoming data and a unique key,
   * create a new entity or returns matching one.
   * @param data
   * @param options
   */
  public async readOrCreate(data: AnyEntity<Entity>, options?: OrmUpsertOptions): Promise<Entity>;
  public async readOrCreate(data: AnyEntity<Entity>[], options?: OrmUpsertOptions): Promise<Entity[]>;
  public async readOrCreate(
    data: AnyEntity<Entity> | AnyEntity<Entity>[], options: OrmUpsertOptions = { },
  ): Promise<Entity | Entity[]> {
    options.allowUpdate = false;
    return this.readCreateOrUpdate(data as any, options);
  }

  /**
   * Based on incoming data and a unique key,
   * create a new entity or update matching one.
   * @param data
   * @param options
   */
  public async createOrUpdate(data: AnyEntity<Entity>, options?: OrmUpsertOptions): Promise<Entity>;
  public async createOrUpdate(data: AnyEntity<Entity>[], options?: OrmUpsertOptions): Promise<Entity[]>;
  public async createOrUpdate(
    data: AnyEntity<Entity> | AnyEntity<Entity>[], options: OrmUpsertOptions = { },
  ): Promise<Entity | Entity[]> {
    options.allowUpdate = true;
    return this.readCreateOrUpdate(data as any, options);
  }

  /**
   * Wrapper responsible for all DELETE operations.
   * @param entities
   */
  public async remove(entity: Entity): Promise<Entity>;
  public async remove(entities: Entity[]): Promise<Entity[]>;
  public async remove(entities: Entity | Entity[]): Promise<Entity| Entity[]> {
    try {
      await this.entityRepository.removeAndFlush(entities);
    }
    catch (e) {
      this.queryExceptionHandler(e, entities);
    }

    return entities;
  }

  /**
   * Removes a single entity by its id.
   * @param id
   */
  public async removeById(id: string): Promise<Entity> {
    const entity = await this.readById(id);
    return this.remove(entity);
  }

  /**
   * Returns provided unique key or default (whichever is valid).
   * @param uniqueKey
   */
  private getValidUniqueKey(uniqueKey?: string[]): string[] {
    const defaultKey = this.serviceOptions.uniqueKey;
    let validKey: string[];

    if (uniqueKey && Array.isArray(uniqueKey) && uniqueKey.length > 0) {
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
   * Handles all query exceptions.
   * @param e
   * @param data
   */
  protected queryExceptionHandler(e: Error, data?: AnyEntity<Entity> | any): void {
    if (/duplicate entry/gi.test(e.message)) {
      const violation = /entry '(.+?)' for/gi.exec(e.message);
      throw new ConflictException({
        message: 'entity already exists',
        key: violation ? violation[1] : null,
      });
    }

    if (/cannot add.+foreign key.+fails/gi.test(e.message)) {
      const violation = /references `(.+?)`/gi.exec(e.message);
      const constraint = violation ? violation[1] : 'undefined';
      throw new BadRequestException(`${constraint} must reference an existing entity`);
    }

    if (/cannot delete.+foreign key.+fails/gi.test(e.message)) {
      const violation = /\.`(.+?)`, constraint/gi.exec(e.message);
      const constraint = violation ? violation[1] : 'undefined';
      throw new ConflictException(`${constraint} constraint prevents cascade deletion`);
    }

    if (/query by not existing property/gi.test(e.message)) {
      const violation = /.+ (.+)/gi.exec(e.message);
      const constraint = violation ? violation[1] : 'undefined';
      throw new BadRequestException(`${constraint.replace('Entity', '').toLowerCase()} should not exist`);
    }

    throw new InternalServerErrorException({
      message: e.message,
      data,
    });
  }

}
