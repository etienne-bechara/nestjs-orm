/* eslint-disable jsdoc/require-jsdoc */
import { ConflictException } from '@bechara/nestjs-core';
import { EntityData, EntityManager, EntityName, RequiredEntityData } from '@mikro-orm/core';

import { OrmReadOptions, OrmReadParams, OrmRepositoryOptions, OrmUpdateParams, OrmUpsertOptions } from '../orm.interface';
import { OrmCreateRepository } from './orm.repository.create';

export abstract class OrmUpdateRepository<Entity extends object> extends OrmCreateRepository<Entity> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Entity>,
    protected readonly repositoryOptions: OrmRepositoryOptions<Entity>,
  ) {
    super(entityManager, entityName, repositoryOptions);
  }

  public update(entities: Entity | Entity[], data: EntityData<Entity>): Promise<Entity[]>;
  public update(params: OrmUpdateParams<Entity> | OrmUpdateParams<Entity>[]): Promise<Entity[]>;
  /**
   * Update target entities, data can be provided as an object that applies to all,
   * or each entity may be combined with its own changeset.
   * @param params
   * @param data
   */
  public update(
    params: Entity | Entity[] | OrmUpdateParams<Entity> | OrmUpdateParams<Entity>[],
    data?: EntityData<Entity>,
  ): Promise<Entity[]> {
    return this.runWithinSpan('update', async () => {
      if (!this.isValidData(params)) return [ ];

      const paramsArray = Array.isArray(params) ? params : [ params ];
      const assignedEntities: Entity[] = [ ];
      let comboArray: OrmUpdateParams<Entity>[];

      // Normalize update data into the combo standard
      if (data) {
        const entityArray: Entity[] = paramsArray as any;
        comboArray = entityArray.map((e) => ({ entity: e, data }));
      }
      else {
        comboArray = paramsArray as any;
      }

      // Before assignment, ensure one to many and many to many collections were populated
      await Promise.all(
        comboArray.map(async ({ entity, data }) => {
          for (const key in entity as any) {
            if (data?.[key] && entity[key]?.isInitialized && entity[key]?.toArray && !entity[key].isInitialized()) {
              await entity[key].init();
            }
          }

          const assignedEntity = this.entityManager.assign(entity, data);
          assignedEntities.push(assignedEntity);
        }),
      );

      await this.entityManager.persistAndFlush(assignedEntities);
      return assignedEntities;
    });
  }

  /**
   * Update all entities that match target criteria based on provided data.
   * @param params
   * @param data
   * @param options
   */
  public async updateBy<P extends string = never>(
    params: OrmReadParams<Entity>,
    data: EntityData<Entity>,
    options: OrmReadOptions<Entity, P> = { },
  ): Promise<Entity[]> {
    const entities = await this.readBy(params, options);
    return this.update(entities, data);
  }

  /**
   * Update an entity by its ID based on provided data.
   * @param id
   * @param data
   */
  public async updateById(id: string | number, data: EntityData<Entity>): Promise<Entity> {
    const entity = await this.readByIdOrFail(id);
    const [ updatedEntity ] = await this.update(entity, data);
    return updatedEntity;
  }

  /**
   * Updates a single entity based on provided data.
   * @param entity
   * @param data
   */
  public async updateOne(entity: Entity, data: EntityData<Entity>): Promise<Entity> {
    const [ updatedEntity ] = await this.update(entity, data);
    return updatedEntity;
  }

  /**
   * Read, create or update according to provided constraints.
   * An unique key must be specified at repository or method options.
   * @param data
   * @param options
   */
  public upsert<P extends string = never>(
    data: EntityData<Entity> | EntityData<Entity>[],
    options: OrmUpsertOptions<Entity, P> = { },
  ): Promise<Entity[]> {
    // eslint-disable-next-line complexity
    return this.runWithinSpan('upsert', async () => {
      if (!this.isValidData(data)) return [ ];

      const dataArray = Array.isArray(data) ? data : [ data ];
      const uniqueKey = this.getValidUniqueKey(options.uniqueKey);
      const nestedPks = this.getNestedPrimaryKeys();
      const pk = this.getPrimaryKey();

      const resultMap: { index: number; target: 'read' | 'create' | 'update' }[] = [ ];
      const updateParams: OrmUpdateParams<Entity>[] = [ ];
      const createData: RequiredEntityData<Entity>[] = [ ];
      const existingEntities: Entity[] = [ ];
      let createdEntities: Entity[];

      // Create clauses to match existing entities
      const clauses = dataArray.map((data) => {
        const clause: Record<keyof Entity, any> = { } as any;

        for (const key of uniqueKey) {
          const stringKey = key as string;
          clause[key] = data[stringKey];
        }

        return clause;
      });

      // Find matching data, ensure to populate array data that are 1:m or m:n relations
      const populate = Array.isArray(options.populate) ? options.populate : [ ];
      const sampleData = dataArray[0];

      for (const key in sampleData) {
        if (Array.isArray(sampleData[key]) && this.entityManager.canPopulate(this.entityName, key)) {
          populate.push(key);
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const matchingEntities = await this.readBy({ $or: clauses } as any, { populate });

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

            // Match nested entities or direct values
            if (isNestedEntity) {
              if (clauses[i][key]?.[matchingNestedPk] || clauses[i][key]?.[matchingNestedPk] === 0) {
                if (e[key][matchingNestedPk] !== clauses[i][key][matchingNestedPk]) return false;
              }
              else {
                if (e[key][matchingNestedPk] !== clauses[i][key]) return false;
              }
            }
            else {
              if (e[key] !== clauses[i][key]) return false;
            }
          }

          return true;
        });

        return { data, entity };
      });

      // Analyse resulting matches
      for (const match of matches) {
        // Conflict (error)
        if (match.entity.length > 1) {
          throw new ConflictException({
            message: 'unique constraint references more than one entity',
            uniqueKey,
            matches: match.entity.map((e) => e[pk]),
          });
        }

        // Match (create or update) or missing (create)
        if (match.entity.length === 1) {
          if (!options.disallowUpdate) {
            resultMap.push({ index: updateParams.length, target: 'update' });
            updateParams.push({ entity: match.entity[0], data: match.data });
          }
          else {
            resultMap.push({ index: existingEntities.length, target: 'read' });
            existingEntities.push(match.entity[0]);
          }
        }
        else {
          resultMap.push({ index: createData.length, target: 'create' });
          createData.push(match.data as RequiredEntityData<Entity>);
        }
      }

      // If two upsert operations run concurrently the second creation will likely fail
      // Allow a single retry to prevent this scenario unless `disallowRetry` is set
      try {
        createdEntities = createData.length > 0
          ? await this.create(createData)
          : [ ];
      }
      catch (e) {
        if (options.disallowRetry) throw e;
        return this.upsert(data, { ...options, disallowRetry: true });
      }

      const updatedEntities = updateParams.length > 0
        ? await this.update(updateParams)
        : [ ];

      const resultEntities = resultMap.map((i) => {
        switch (i.target) {
          case 'read': return existingEntities[i.index];
          case 'create': return createdEntities[i.index];
          case 'update': return updatedEntities[i.index];
        }
      });

      return resultEntities;
    });
  }

  /**
   * Read, create or update according to provided constraints.
   * An unique key must be specified at repository or method options.
   * @param data
   * @param options
   */
  public async upsertOne<P extends string = never>(
    data: EntityData<Entity>,
    options: OrmUpsertOptions<Entity, P> = { },
  ): Promise<Entity> {
    const [ resultEntity ] = await this.upsert(data, options);
    return resultEntity;
  }

}
