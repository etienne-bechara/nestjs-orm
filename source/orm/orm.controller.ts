import { UseInterceptors } from '@bechara/nestjs-core';

import { OrmEntitySerializer } from './orm.interceptor';
import { OrmReadArguments } from './orm.interface';
import { OrmService } from './orm.service';

/**
 * Implements generic CRUD controller connected to an entity service.
 */
@UseInterceptors(OrmEntitySerializer)
export abstract class OrmController<Entity> {

  public constructor(
    public readonly entityService: OrmService<Entity>,
  ) { }

  /**
   * Given a request query object:
   * - Split properties between params and options
   * - Reorganize filter operator to expected ORM format
   * - Validate filter operators.
   * @param query
   */
  protected getReadArguments(query: any): OrmReadArguments<Entity> {
    if (!query || typeof query !== 'object') return;

    const optionsProperties = new Set([ 'sort', 'order', 'limit', 'offset' ]);
    const options = { };

    for (const key in query) {
      if (optionsProperties.has(key)) {
        options[key] = query[key];
        delete query[key];
      }
    }

    return { options, params: query };
  }

}

