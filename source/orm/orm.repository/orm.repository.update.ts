import { ConflictException } from '@bechara/nestjs-core';
import { EntityData, EntityManager, EntityName } from '@mikro-orm/core';

import { OrmRepositoryOptions, OrmUpdateOptions, OrmUpdateParams, OrmUpsertOptions } from '../orm.interface';
import { OrmBaseRepository } from './orm.repository.base';
import { OrmCreateRepository } from './orm.repository.create';

export abstract class OrmUpdateRepository<Entity> extends OrmCreateRepository<Entity> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Entity>,
    protected readonly repositoryOptions: OrmRepositoryOptions<Entity>,
  ) {
    super(entityManager, entityName, repositoryOptions);
  }

  /**
   * Update target entities based on provided data.
   * In case of multiple, target amount must match data amount.
   * @param params
   * @param options
   */
  public async update(
    params: OrmUpdateParams<Entity> | OrmUpdateParams<Entity>[], options: OrmUpdateOptions<Entity> = { },
  ): Promise<Entity[]> {
    const { flush, reload } = options;
    const paramsArray = Array.isArray(params) ? params : [ params ];
    if (!params || paramsArray.length === 0) return [ ];

    // Before assignment, ensure one to many and many to many collections were populated
    const assignedEntities = await Promise.all(
      paramsArray.map(async ({ entity, data }) => {
        for (const key in entity as any) {
          if (data?.[key] && entity[key]?.isInitialized && entity[key]?.toArray && !entity[key].isInitialized()) {
            await entity[key].init();
          }
        }

        return this.assign(entity, data);
      }),
    );

    try {
      flush
        ? await this.persistAndFlush(assignedEntities)
        : this.persist(assignedEntities);
    }
    catch (e) {
      OrmBaseRepository.handleException(e, params);
    }

    const updatedEntities = reload
      ? await this.reload(assignedEntities, options)
      : assignedEntities;

    return updatedEntities;
  }

  /**
   * Update a singles entity by its ID.
   * @param id
   * @param data
   * @param options
   */
  public async updateById(
    id: string | number, data: EntityData<Entity>, options: OrmUpdateOptions<Entity> = { },
  ): Promise<Entity> {
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
  public async updateOne(
    entity: Entity, data: EntityData<Entity>, options: OrmUpdateOptions<Entity> = { },
  ): Promise<Entity> {
    const [ updatedEntity ] = await this.update({ entity, data }, options);
    return updatedEntity;
  }

  /**
   * Read, create or update according to provided constraints.
   * An unique key must be specified either at service or method options.
   * @param data
   * @param options
   */
  private async readInsertOrUpdate(
    data: EntityData<Entity>, options: OrmUpsertOptions<Entity> = { },
  ): Promise<Entity[]> {
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
          message: `unique constraint references more than one ${this.repositoryOptions.displayName}`,
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
        ? await this.insert(createData, options)
        : [ ];
    }
    catch (e) {
      if (options.disableRetry) throw e;
      options.disableRetry = true;
      return this.readInsertOrUpdate(data, options);
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
  public async readOrInsert(data: EntityData<Entity>, options: OrmUpsertOptions<Entity> = { }): Promise<Entity[]> {
    options.allowUpdate = false;
    return this.readInsertOrUpdate(data, options);
  }

  /**
   * Read or create a single entity based on provided data.
   * An unique key must be specified either at service or method options.
   * @param data
   * @param options
   */
  public async readOrInsertOne(data: EntityData<Entity>, options: OrmUpsertOptions<Entity> = { }): Promise<Entity> {
    const [ entity ] = await this.readOrInsert(data, options);
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
    return this.readInsertOrUpdate(data, options);
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

}
