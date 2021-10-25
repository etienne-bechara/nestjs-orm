import { BadRequestException, ConflictException, ContextStorage, InternalServerErrorException, NotImplementedException } from '@bechara/nestjs-core';
import { AnyEntity, EntityData, EntityManager, EntityName, EntityRepository, New, Populate } from '@mikro-orm/core';
import { QueryBuilder as MySqlQueryBuilder } from '@mikro-orm/mysql';
import { QueryBuilder as PostgreSqlQueryBuilder } from '@mikro-orm/postgresql';

import { OrmStoreKey } from '../orm.enum';
import { OrmRepositoryOptions } from '../orm.interface/orm.repository.options';

export abstract class OrmBaseRepository<Entity> extends EntityRepository<Entity> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Entity>,
    protected readonly repositoryOptions: OrmRepositoryOptions<Entity>,
  ) {
    super(entityManager, entityName);
  }

  /**
   * Acquires current request storage.
   */
  private getStore(): Map<string, any> {
    return ContextStorage.getStore();
  }

  /**
   * Sets pending commit flag.
   */
  private setCommitPending(): void {
    this.getStore()?.set(OrmStoreKey.COMMIT_PENDING, true);
  }

  /**
   * Clears pending commit flag.
   */
  private clearCommitPending(): void {
    this.getStore()?.set(OrmStoreKey.COMMIT_PENDING, false);
  }

  /**
   * Execute all pending entity changes.
   */
  private async sync(): Promise<void> {
    this.clearCommitPending();

    try {
      await this.entityManager.flush();
    }
    catch (e) {
      OrmBaseRepository.handleException(e);
    }
  }

  /**
   * Validates if provided data is valid as single or multiple entities.
   * @param entities
   */
  protected isValidEntity(entities: Entity | Entity[]): boolean {
    return Array.isArray(entities) ? entities.length > 0 : !!entities;
  }

  /**
   * Mark entities changes to be removed on the next commit call.
   * @param entities
   */
  protected removeAsync(entities: Entity | Entity[]): void {
    if (!this.isValidEntity(entities)) return;
    this.entityManager.remove(entities);
    this.setCommitPending();
  }

  /**
   * Mark entities changes to be persisted on the next commit call.
   * @param entities
   */
  public commitAsync(entities: Entity | Entity[]): void {
    if (!this.isValidEntity(entities)) return;
    this.entityManager.persist(entities);
    this.setCommitPending();
  }

  /**
   * Persist all entities changes, if any entity is provided
   * mark it for persistance prior to committing.
   * @param entities
   */
  public async commit(entities?: Entity | Entity[]): Promise<void> {
    if (entities) {
      this.commitAsync(entities);
    }

    await this.sync();
  }

  /**
   * Clear all pending operations on entity manager.
   */
  public rollback(): void {
    const cleanEntityManager = this.entityManager.fork(true);
    this.getStore().set(OrmStoreKey.ENTITY_MANAGER, cleanEntityManager);
    this.clearCommitPending();
  }

  /**
   * Creates a query builder instance .
   */
  public createQueryBuilder(): MySqlQueryBuilder<Entity> | PostgreSqlQueryBuilder<Entity> {
    return this.entityManager['createQueryBuilder'](this.entityName);
  }

  /**
   * Returns custom primary key or 'id'.
   */
  protected getPrimaryKey(): string {
    return this.repositoryOptions.primaryKey || 'id';
  }

  /**
   * Returns custom nested primary keys including id.
   */
  protected getNestedPrimaryKeys(): string[] {
    this.repositoryOptions.nestedPrimaryKeys ??= [];
    return [ 'id', ...this.repositoryOptions.nestedPrimaryKeys ];
  }

  /**
   * Returns provided unique key or default (whichever is valid).
   * @param uniqueKey
   */
  protected getValidUniqueKey(uniqueKey?: (keyof Entity)[]): (keyof Entity)[] {
    const defaultKey = this.repositoryOptions.defaultUniqueKey;
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
  public static handleException(e: Error, data?: any): void {
    if (/duplicate entry/gi.test(e.message)) {
      const entityName = /key '(.+?)\./gi.exec(e.message);
      const violation = /entry '(.+?)' for/gi.exec(e.message);
      throw new ConflictException({
        message: `${entityName ? entityName[1] : 'entity'} already exists`,
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

  /**
   * Use `readBy()`.
   * @deprecated
   */
  public find(): Promise<any> { return; }

  /**
   * Use `readBy()`.
   * @deprecated
   */
  public findAll(): Promise<any> { return; }

  /**
   * Use `readOne()`.
   * @deprecated
   */
  public findOne(): Promise<any> { return; }

  /**
   * Use `readOneOrFail()`.
   * @deprecated
   */
  public findOneOrFail(): Promise<any> { return; }

  /**
   * Use `countBy()`.
   * @deprecated
   */
  public count(): Promise<any> { return; }

  /**
   * Use `readAndCountBy()`.
   * @deprecated
   */
  public findAndCount(): Promise<any> { return; }

  /**
   * Use `deleteBy()`.
   * @deprecated
   */
  public nativeDelete(): Promise<any> { return; }

  /**
   * Use `createFrom()`.
   * @deprecated
   */
  public nativeInsert(): Promise<any> { return; }

  /**
   * Use `updateBy()`.
   * @deprecated
   */
  public nativeUpdate(): Promise<any> { return; }

  /**
   * Use `commitAsync()`.
   * @param entity
   * @deprecated
   */
  public persist(entity: AnyEntity | AnyEntity[]): EntityManager {
    return super.persist(entity);
  }

  /**
   * Use `commit()`.
   * @deprecated
   */
  public async flush(): Promise<void> {
    return super.flush();
  }

  /**
   * Use `commit()`.
   * @param entity
   * @deprecated
   */
  public async persistAndFlush(entity: AnyEntity | AnyEntity[]): Promise<void> {
    return super.persistAndFlush(entity);
  }

  /**
   * Use `deleteAsync()`.
   * @param entity
   * @deprecated
   */
  public remove(entity: AnyEntity | AnyEntity[]): EntityManager {
    return super.remove(entity);
  }

  /**
   * Use `delete()`.
   * @param entity
   * @deprecated
   */
  public async removeAndFlush(entity: AnyEntity | AnyEntity[]): Promise<void> {
    return super.removeAndFlush(entity);
  }

  /**
   * Use `createFrom()`.
   * @param data
   * @deprecated
   */
  public create<P extends Populate<Entity> = string[]>(data: EntityData<Entity>): New<Entity, P> {
    return super.create(data);
  }

  /**
   * Use `update()`.
   * @param entity
   * @param data
   * @deprecated
   */
  public assign(entity: Entity, data: EntityData<Entity>): Entity {
    return super.assign(entity, data);
  }

}
