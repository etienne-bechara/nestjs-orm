/* eslint-disable jsdoc/require-param */
/* eslint-disable complexity */
/* eslint-disable max-len */
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
  ) {
    this.serviceOptions.entityName ??= 'entity';
  }

  /** Before Read Hook. */
  protected beforeRead(params: OrmReadParams<Entity>): OrmReadParams<Entity> | Promise<OrmReadParams<Entity>> { return params; }
  /** After Read Hook. */
  protected afterRead(entity: Entity): Entity | Promise<Entity> { return entity; }

  /** Before Create Hook. */
  protected beforeCreate(data: EntityData<Entity>): EntityData<Entity>| Promise<EntityData<Entity>> { return data; }
  /** After Create Hook. */
  protected afterCreate(entity: Entity): Entity | Promise<Entity> { return entity; }

  /** Before Update Hook. */
  protected beforeUpdate(params: OrmUpdateParams<Entity>): OrmUpdateParams<Entity> | Promise<OrmUpdateParams<Entity>> { return params; }
  /** After Update Hook. */
  protected afterUpdate(entity: Entity): Entity | Promise<Entity> { return entity; }

  /** Before Remove Hook. */
  protected beforeRemove(entity: Entity): Entity | Promise<Entity> { return entity; }
  /** After Remove Hook. */
  protected afterRemove(entity: Entity): Entity | Promise<Entity> { return entity; }

  /**
   * Returns custom primary key or 'id'.
   */
  private getPrimaryKey(): string {
    return this.serviceOptions.primaryKey || 'id';
  }

  /**
   * Returns custom nested primary keys including id.
   */
  private getNestedPrimaryKeys(): string[] {
    this.serviceOptions.nestedPrimaryKeys ??= [];
    return [ 'id', ...this.serviceOptions.nestedPrimaryKeys ];
  }

  /**
   * Execute ORM smart nested population on target entities.
   * @param entities
   * @param populate
   */
  public async populate(entities: Entity | Entity[], populate: Populate<Entity>): Promise<void> {
    if (!entities || Array.isArray(entities) && entities.length === 0) return;
    await this.entityRepository.populate(entities, populate);
  }

  /**
   * Read entities matching given criteria, allowing pagination
   * and population options.
   * @param params
   * @param options
   */
  public async read(params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { }): Promise<Entity[]> {
    if (!params || Array.isArray(params) && params.length === 0) return [ ];

    options.populate ??= this.serviceOptions.defaultPopulate ?? false;
    options.refresh = true;
    let readEntities: Entity[];

    if (options.sort && options.order) {
      options.orderBy = { [options.sort]: options.order };
    }

    const findParams = await this.beforeRead(params);

    try {
      // eslint-disable-next-line unicorn/no-array-method-this-argument
      readEntities = await this.entityRepository.find(findParams as EntityData<Entity>, options);
      readEntities ??= [ ];
    }
    catch (e) {
      this.queryExceptionHandler(e, readEntities);
    }

    if (!readEntities[0] && options.findOrFail) {
      throw new NotFoundException(`${this.serviceOptions.entityName} does not exist`);
    }

    for (const [ index, entity ] of readEntities.entries()) {
      readEntities[index] = await this.afterRead(entity);
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
      count = await this.entityRepository.count(params as FilterQuery<Entity>);
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
        message: `unique constraint references more than one ${this.serviceOptions.entityName}`,
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
   * Create multiple entities based on provided data.
   * @param data
   * @param options
   */
  public async create(data: EntityData<Entity>, options: OrmCreateOptions<Entity> = { }): Promise<Entity[]> {
    const dataArray = Array.isArray(data) ? data : [ data ];
    if (!data || dataArray.length === 0) return [ ];

    for (const [ index, dataItem ] of dataArray.entries()) {
      dataArray[index] = await this.beforeCreate(dataItem);
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

    for (const [ index, entity ] of createdEntities.entries()) {
      createdEntities[index] = await this.afterCreate(entity);
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
   * In case of multiple, target amount must match data amount.
   * @param params
   * @param options
   */
  public async update(params: OrmUpdateParams<Entity> | OrmUpdateParams<Entity>[], options: OrmUpdateOptions<Entity> = { }): Promise<Entity[]> {
    const paramsArray = Array.isArray(params) ? params : [ params ];
    if (!params || paramsArray.length === 0) return [ ];

    for (const [ index, param ] of paramsArray.entries()) {
      paramsArray[index] = await this.beforeUpdate(param);
    }

    // Before assignment, ensure one to many and many to many collections were populated
    const assignedEntities = await Promise.all(
      paramsArray.map(async ({ entity, data }) => {
        for (const key in entity as any) {
          if (data?.[key] && entity[key]?.isInitialized && entity[key]?.toArray && !entity[key].isInitialized()) {
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

    for (const [ index, entity ] of updatedEntities.entries()) {
      updatedEntities[index] = await this.afterUpdate(entity);
    }

    return updatedEntities;
  }

  /**
   * Update a singles entity by its ID.
   * @param id
   * @param data
   * @param options
   */
  public async updateById(id: string | number, data: EntityData<Entity>, options: OrmUpdateOptions<Entity> = { }): Promise<Entity> {
    const entity = await this.readByIdOrFail(id);
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
    const dataArray = Array.isArray(data) ? data : [ data ];
    if (!data || dataArray.length === 0) return [ ];

    const uniqueKey = this.getValidUniqueKey(options.uniqueKey);
    const nestedPks = this.getNestedPrimaryKeys();
    const pk = this.getPrimaryKey();

    const resultMap: { index: number; target: 'read' | 'create' | 'update' }[] = [ ];
    const updateParams: OrmUpdateParams<Entity>[] = [ ];
    const createData: EntityData<Entity>[] = [ ];
    const existingEntities: Entity[] = [ ];

    // Create clauses to match existing entities
    const clauses = dataArray.map((data) => {
      const clause: Record<keyof Entity, any> = { } as any;
      for (const key of uniqueKey) clause[key] = data[key];
      return clause;
    });

    // Find matching data, ensure to populate array data which most likely are 1:m or m:n relations
    const populate = [ ];
    const sampleData = dataArray[0];
    for (const key in sampleData) Array.isArray(sampleData[key]) ? populate.push(key) : undefined;
    const matchingEntities = await this.read({ $or: clauses }, { populate });

    // Find matching entities for each item on original data
    const matches = dataArray.map((data, i) => {
      const entity = matchingEntities.filter((e: any) => {
        // Iterate each clause of unique key definition
        for (const key in clauses[i]) {
          // Check if matching a nested entity
          let isNestedEntity = false;
          let matchingNestedPk: string;

          for (const nestedPk of nestedPks) {
            if (e[key]?.[nestedPk] || e[key]?.[nestedPk] === 0) {
              matchingNestedPk = nestedPk;
              isNestedEntity = true;
              break;
            }
          }

          // Match nested entities
          if (isNestedEntity) {
            if (clauses[i][key]?.[matchingNestedPk] || clauses[i][key]?.[matchingNestedPk] === 0) {
              if (e[key][matchingNestedPk] !== clauses[i][key][matchingNestedPk]) return false;
            }
            else {
              if (e[key][matchingNestedPk] !== clauses[i][key]) return false;
            }
          }
          // Match direct value
          else {
            if (e[key] !== clauses[i][key]) return false;
          }
        }

        return true;
      });

      return { data, entity };
    });

    for (const match of matches) {
      // Conflict (error)
      if (match.entity.length > 1) {
        throw new ConflictException({
          message: `unique constraint references more than one ${this.serviceOptions.entityName}`,
          uniqueKey,
          matches: match.entity.map((e) => e[pk]),
        });
      }

      // Match (create or update)
      if (match.entity.length === 1) {
        if (options.allowUpdate) {
          resultMap.push({ index: updateParams.length, target: 'update' });
          updateParams.push({ entity: match.entity[0], data: match.data });
        }
        else {
          resultMap.push({ index: existingEntities.length, target: 'read' });
          existingEntities.push(match.entity[0]);
        }
      }
      // Missing (create)
      else {
        resultMap.push({ index: createData.length, target: 'create' });
        createData.push(match.data);
      }
    }

    // Allow a single retry to handle concurrent creation
    let createdEntities: Entity[];

    try {
      createdEntities = createData.length > 0
        ? await this.create(createData, options)
        : [ ];
    }
    catch (e) {
      if (options.disableRetry) throw e;
      options.disableRetry = true;
      return this.readCreateOrUpdate(data, options);
    }

    const updatedEntities = updateParams.length > 0
      ? await this.update(updateParams, options)
      : [ ];

    const reloadedEntities = existingEntities.length > 0
      ? await this.reload(existingEntities, options)
      : [ ];

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
    if (!entities || entityArray.length === 0) return [ ];

    for (const [ index, entity ] of entityArray.entries()) {
      entityArray[index] = await this.beforeRemove(entity);
    }

    try {
      await this.entityRepository.removeAndFlush(entityArray);
    }
    catch (e) {
      this.queryExceptionHandler(e, entities);
    }

    for (const [ index, entity ] of entityArray.entries()) {
      entityArray[index] = await this.afterRemove(entity);
    }

    return entityArray;
  }

  /**
   * Remove a single entity by its ID.
   * @param id
   */
  public async removeById(id: string | number): Promise<Entity> {
    const entity = await this.readByIdOrFail(id);
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
  protected getValidUniqueKey(uniqueKey?: (keyof Entity)[]): (keyof Entity)[] {
    const defaultKey = this.serviceOptions.defaultUniqueKey;
    let validKey: (keyof Entity)[];

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
        message: `${this.serviceOptions.entityName} already exists`,
        constraint: violation ? violation[1] : null,
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
