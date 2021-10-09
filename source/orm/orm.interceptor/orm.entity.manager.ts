import { CallHandler, ContextService, ExecutionContext, Injectable, mergeMap, NestInterceptor } from '@bechara/nestjs-core';
import { MikroORM } from '@mikro-orm/core';

import { OrmStoreKey } from '../orm.enum';
import { OrmBaseRepository } from '../orm.repository/orm.repository.base';

@Injectable()
export class OrmEntityManager implements NestInterceptor {

  public constructor(
    private readonly mikroOrm: MikroORM,
    private readonly contextService: ContextService,
  ) { }

  /**
   * Before a new request arrives at controller, creates a fresh entity
   * manager for manipulation.
   *
   * After processing, if returning data contain entity classes, call
   * their stringify method as well as remove reference recursion.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): any {
    const store = this.contextService.getStore();
    let entityManager = this.mikroOrm.em.fork(true, true);
    store.set(OrmStoreKey.ENTITY_MANAGER, entityManager);

    return next
      .handle()
      .pipe(
        mergeMap(async (data) => {
          const flushPending = store.get(OrmStoreKey.FLUSH_PENDING);

          if (flushPending) {
            try {
              entityManager = store.get(OrmStoreKey.ENTITY_MANAGER);
              await entityManager.flush();
            }
            catch (e) {
              OrmBaseRepository.handleException(e);
            }
          }

          return this.stringifyEntities(data);
        }),
      );
  }

  /**
   * Given any data object, check for entities and execute their
   * stringify method.
   * @param data
   */
  private stringifyEntities(data: any): any {
    if (!data) return;

    // Array of entities
    if (Array.isArray(data)) {
      data = data.map((d) => d?.toJSON ? d.toJSON() : d);
      for (const d of data) this.eliminateRecursion(d.id, d);
    }

    // Paginated entity
    if (data.records && Array.isArray(data.records)) {
      data.records = data.records.map((d) => d?.toJSON ? d.toJSON() : d);
      for (const d of data.records) this.eliminateRecursion(d.id, d);
    }

    // Single entity
    if (data.toJSON) {
      data = data.toJSON();
      this.eliminateRecursion(data.id, data);
    }

    return data;
  }

  /**
   * Given an object, eliminate properties that references its parent id.
   * @param parentId
   * @param data
   */
  private eliminateRecursion(parentId: string, data: any): void {
    if (!data || !parentId || typeof data !== 'object') return;

    if (Array.isArray(data)) {
      for (const d of data) this.eliminateRecursion(parentId, d);
      return;
    }

    for (const key in data) {
      if (key === 'id') continue;

      if (data[key] === parentId || data[key]?.id === parentId) {
        delete data[key];
      }
      else if (typeof data[key] === 'object') {
        this.eliminateRecursion(parentId, data[key]);
      }
    }
  }

}
