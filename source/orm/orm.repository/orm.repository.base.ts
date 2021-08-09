import { BadRequestException, ConflictException, InternalServerErrorException, NotImplementedException, RequestStorage } from '@bechara/nestjs-core';
import { AnyEntity, Connection, EntityManager, EntityName, EntityRepository, IDatabaseDriver } from '@mikro-orm/core';
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
   * Acquires current request storage.
   */
  private getStore(): Map<string, any> {
    return RequestStorage.getStore();
  }

  /**
   * When flushing remove pending flush flag.
   */
  public async flush(): Promise<void> {
    this.getStore()?.set(OrmStoreKey.FLUSH_PENDING, false);
    return super.flush();
  }

  /**
   * When persisting, set pending flush flag.
   * @param entity
   */
  public persist(entity: AnyEntity<any> | AnyEntity<any>[]): EntityManager<IDatabaseDriver<Connection>> {
    this.getStore()?.set(OrmStoreKey.FLUSH_PENDING, true);
    return super.persist(entity);
  }

  /**
   * When removing, set pending flush flag.
   * @param entity
   */
  public remove(entity: AnyEntity<any>): EntityManager<IDatabaseDriver<Connection>> {
    this.getStore()?.set(OrmStoreKey.FLUSH_PENDING, true);
    return super.remove(entity);
  }

  /**
   * Creates a query builder instance .
   */
  public createQueryBuilder(): MySqlQueryBuilder<Entity> | PostgreSqlQueryBuilder<Entity> {
    return this.entityManager['createQueryBuilder'](this.entityName);
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

}
