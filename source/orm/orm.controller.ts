import { UseInterceptors } from '@bechara/nestjs-core';

import { OrmEntitySerializer } from './orm.interceptor';
import { OrmReadArguments } from './orm.interface';
import { OrmService } from './orm.service';

@UseInterceptors(OrmEntitySerializer)
export abstract class OrmController<Entity> {

  public constructor(
    public readonly entityService: OrmService<Entity>,
  ) { }

  /**
   * Given a request query, split properties between params and options.
   * @param query
   */
  protected getReadArguments(query: any): OrmReadArguments<Entity> {
    if (!query || typeof query !== 'object') return;

    const optionsProperties = new Set([ 'sort', 'order', 'limit', 'offset' ]);
    const params = { };
    const options = { };

    for (const key in query) {
      if (optionsProperties.has(key)) {
        options[key] = query[key];
      }
      else {
        params[key] = query[key];
      }
    }

    return { options, params };
  }

}

