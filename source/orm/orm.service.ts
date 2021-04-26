/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable max-len */
/* eslint-disable unicorn/no-fn-reference-in-iterator */
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException, NotImplementedException } from '@bechara/nestjs-core';
import { EntityData, EntityRepository, FilterQuery, Populate } from '@mikro-orm/core';

import { OrmQueryOrder } from './orm.enum';
import { OrmCreateOptions, OrmPagination, OrmReadOptions, OrmReadParams, OrmServiceOptions, OrmUpdateOptions, OrmUpdateParams, OrmUpsertOptions } from './orm.interface';

/**
 * Creates an abstract service tied with a repository.
 */
export abstract class OrmService<Entity> {

  public constructor(
    private readonly entityRepository: EntityRepository<Entity>,
    protected readonly serviceOptions: OrmServiceOptions<Entity> = { },
  ) { }

  /* Extendable Hooks */
  protected async beforeRead(params: OrmReadParams<Entity>): Promise<OrmReadParams<Entity>> { return params; }
  protected async afterRead(entity: Entity): Promise<Entity> { return entity; }

  protected async beforeCreate(data: EntityData<Entity>): Promise<EntityData<Entity>> { return data; }
  protected async afterCreate(entity: Entity): Promise<Entity> { return entity; }

  protected async beforeUpdate(params: OrmUpdateParams<Entity>): Promise<OrmUpdateParams<Entity>> { return params; }
  protected async afterUpdate(entity: Entity): Promise<Entity> { return entity; }

  protected async beforeRemove(entity: Entity): Promise<Entity> { return entity; }
  protected async afterRemove(entity: Entity): Promise<Entity> { return entity; }

  /**
   * Execute ORM smart nested population on target entities.
   * @param entities
   * @param populate
   */
  public async populate(entities: Entity | Entity[], populate: Populate<Entity>): Promise<void> {
    await this.entityRepository.populate(entities, populate);
  }

  /**
   * Read entities matching given criteria, allowing pagination
   * and population options.
   * @param params
   * @param options
   */
  public async read(params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { }): Promise<Entity[]> {
    options.populate ??= this.serviceOptions.defaultPopulate ?? false;
    options.refresh = true;
    let readEntities: Entity[];

    if (options.sort && options.order) {
      options.orderBy = { [options.sort]: options.order };
    }

    const findParams = typeof params === 'string'
      ? { id: params }
      : await this.beforeRead(params);

    try {
      readEntities = await this.entityRepository.find(findParams as EntityData<Entity>, options);
      readEntities ??= [ ];
    }
    catch (e) {
      this.queryExceptionHandler(e, readEntities);
    }

    if (!readEntities[0] && options.findOrFail) {
      const entityError = typeof params === 'string' ? 'id' : 'params';
      throw new NotFoundException(`entity with given ${entityError} does not exist`);
    }

    for (let entity of readEntities) {
      entity = await this.afterRead(entity);
    }

    return readEntities;
  }

  /**
   * Count entities matching given criteria.
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
   * Read a single entity by its ID.
   * @param id
   * @param options
   */
  public async readById(id: string, options: OrmReadOptions<Entity> = { }): Promise<Entity> {
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
  public async readAndCount(params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { }): Promise<OrmPagination<Entity>> {
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
   * Update target entities according to configuration,
   * keeps original sorting.
   * @param entities
   * @param options
   */
  public async reload(entities: Entity[], options: OrmReadOptions<Entity> = { }): Promise<Entity[]> {
    const entityIds = entities.map((e) => e['id']);
    const orderedEntities: Entity[] = [ ];

    const reloadedEntities = await this.read(entityIds, options);

    for (const id of entityIds) {
      for (const [ index, entity ] of reloadedEntities.entries()) {
        if (entity['id'] === id) {
          orderedEntities.push(entity);
          reloadedEntities.splice(index, 1);
          continue;
        }
      }
    }

    return orderedEntities;
  }

  /**
   * Create multiple entities based on provided data.
   * @param data
   * @param options
   */
  public async create(data: EntityData<Entity>, options: OrmCreateOptions<Entity> = { }): Promise<Entity[]> {
    const dataArray = Array.isArray(data) ? data : [ data ];

    for (let dataItem of dataArray) {
      dataItem = await this.beforeCreate(dataItem);
    }

    const newEntities = dataArray.map((d) => this.entityRepository.create(d));

    try {
      await this.entityRepository.persistAndFlush(newEntities);
    }
    catch (e) {
      this.queryExceptionHandler(e, newEntities);
    }

    const createdEntities = options.disableReload
      ? newEntities
      : await this.reload(newEntities, options);

    for (let entity of createdEntities) {
      entity = await this.afterCreate(entity);
    }

    return createdEntities;
  }

  /**
   * Create a single entity based on provided data.
   * @param data
   * @param options
   */
  public async createOne(data: EntityData<Entity>, options: OrmCreateOptions<Entity> = { }): Promise<Entity> {
    const [ createdEntity ] = await this.create(data, options);
    return createdEntity;
  }

  /**
   * Update target entities based on provided data.
   * In cane of multiple, target amount must match data amount.
   * @param params
   * @param options
   */
  public async update(params: OrmUpdateParams<Entity> | OrmUpdateParams<Entity>[], options: OrmUpdateOptions<Entity> = { }): Promise<Entity[]> {
    const paramsArray = Array.isArray(params) ? params : [ params ];

    for (let param of paramsArray) {
      param = await this.beforeUpdate(param);
    }

    // Before assignment, ensure collections were populated
    const assignedEntities = await Promise.all(
      paramsArray.map(async ({ entity, data }) => {
        for (const key in entity as any) {
          if (data?.[key] && entity[key]?.isInitialized && !entity[key].isInitialized()) {
            await entity[key].init();
          }
        }

        return this.entityRepository.assign(entity, data);
      }),
    );

    try {
      await this.entityRepository.persistAndFlush(assignedEntities);
    }
    catch (e) {
      this.queryExceptionHandler(e, params);
    }

    const updatedEntities = options.disableReload
      ? assignedEntities
      : await this.reload(assignedEntities, options);

    for (let entity of updatedEntities) {
      entity = await this.afterUpdate(entity);
    }

    return updatedEntities;
  }

  /**
   * Update a singles entity by its ID.
   * @param id
   * @param data
   * @param options
   */
  public async updateById(id: string, data: EntityData<Entity>, options: OrmUpdateOptions<Entity> = { }): Promise<Entity> {
    const entity = await this.readById(id);
    const updatedEntity = await this.update({ entity, data }, options);
    return updatedEntity[0];
  }

  /**
   * Updates a single entity based on provided data.
   * @param entity
   * @param data
   * @param options
   */
  public async updateOne(entity: Entity, data: EntityData<Entity>, options: OrmUpdateOptions<Entity> = { }): Promise<Entity> {
    const [ updatedEntity ] = await this.update({ entity, data }, options);
    return updatedEntity;
  }

  /**
   * Read, create or update according to provided constraints.
   * An unique key must be specified either at service or method options.
   * @param data
   * @param options
   */
  private async readCreateOrUpdate(data: EntityData<Entity>, options: OrmUpsertOptions<Entity> = { }): Promise<Entity[]> {
    const uniqueKey = this.getValidUniqueKey(options.uniqueKey);
    const dataArray = Array.isArray(data) ? data : [ data ];
    const resultMap: { index: number; target: 'read' | 'create' | 'update' }[] = [ ];

    const updateParams: OrmUpdateParams<Entity>[] = [ ];
    const createData: EntityData<Entity>[] = [ ];
    const existingEntities: Entity[] = [ ];

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
          resultMap.push({ index: updateParams.length, target: 'update' });
          updateParams.push({ entity: matchingEntities[0], data: dataItem });
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
      createdEntities = await this.create(createData, options);
    }
    catch (e) {
      if (options.disableRetry) throw e;
      options.disableRetry = true;
      return this.readCreateOrUpdate(data, options);
    }

    const updatedEntities = await this.update(updateParams, options);
    const reloadedEntities = await this.reload(existingEntities, options);

    const resultEntities = resultMap.map((i) => {
      switch (i.target) {
        case 'read': return reloadedEntities[i.index];
        case 'create': return createdEntities[i.index];
        case 'update': return updatedEntities[i.index];
      }
    });

    return resultEntities;
  }

  /**
   * Read or create multiple entities based on provided data.
   * An unique key must be specified either at service or method options.
   * @param data
   * @param options
   */
  public async readOrCreate(data: EntityData<Entity>, options: OrmUpsertOptions<Entity> = { }): Promise<Entity[]> {
    options.allowUpdate = false;
    return this.readCreateOrUpdate(data, options);
  }

  /**
   * Read or create a single entity based on provided data.
   * An unique key must be specified either at service or method options.
   * @param data
   * @param options
   */
  public async readOrCreateOne(data: EntityData<Entity>, options: OrmUpsertOptions<Entity> = { }): Promise<Entity> {
    const [ entity ] = await this.readOrCreate(data, options);
    return entity;
  }

  /**
   * Creates or updates multiple entities based on provided data.
   * An unique key must be specified either at service or method options.
   * @param data
   * @param options
   */
  public async upsert(data: EntityData<Entity>, options: OrmUpsertOptions<Entity> = { }): Promise<Entity[]> {
    options.allowUpdate = true;
    return this.readCreateOrUpdate(data, options);
  }

  /**
   * Creates or updates a single entity  based on provided data.
   * An unique key must be specified either at service or method options.
   * @param data
   * @param options
   */
  public async upsertOne(data: EntityData<Entity>, options: OrmUpsertOptions<Entity> = { }): Promise<Entity> {
    const [ entity ] = await this.upsert(data, options);
    return entity;
  }

  /**
   * Remove target entities.
   * @param entities
   */
  public async remove(entities: Entity | Entity[]): Promise<Entity[]> {
    const entityArray = Array.isArray(entities) ? entities : [ entities ];

    for (let entity of entityArray) {
      entity = await this.beforeRemove(entity);
    }

    try {
      await this.entityRepository.removeAndFlush(entityArray);
    }
    catch (e) {
      this.queryExceptionHandler(e, entities);
    }

    for (let entity of entityArray) {
      entity = await this.beforeRemove(entity);
    }

    return entityArray;
  }

  /**
   * Remove a single entity by its ID.
   * @param id
   */
  public async removeById(id: string): Promise<Entity> {
    const entity = await this.readById(id);
    await this.remove(entity);
    return entity;
  }

  /**
   * Remove a single entity.
   * @param entity
   */
  public async removeOne(entity: Entity): Promise<Entity> {
    const [ removedEntity ] = await this.remove(entity);
    return removedEntity;
  }

  /**
   * Returns provided unique key or default (whichever is valid).
   * @param uniqueKey
   */
  protected getValidUniqueKey(uniqueKey?: string[]): string[] {
    const defaultKey = this.serviceOptions.defaultUniqueKey;
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
   * Handle all query exceptions.
   * @param e
   * @param data
   */
  protected queryExceptionHandler(e: Error, data?: EntityData<Entity> | any): void {
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

    if (e.message.startsWith('Trying to query by not existing property')) {
      const violation = /.+ (.+)/gi.exec(e.message);
      const constraint = violation ? violation[1] : 'undefined';
      throw new BadRequestException(`${constraint.replace('Entity', '').toLowerCase()} should not exist`);
    }

    if (e.message.startsWith('Invalid query condition')) {
      const violation = /condition: (.+)/gi.exec(e.message);
      const constraint = violation ? violation[1] : '{}';
      throw new BadRequestException(`incorrect filter condition ${constraint}`);
    }

    throw new InternalServerErrorException({
      message: e.message,
      data,
    });
  }

}
