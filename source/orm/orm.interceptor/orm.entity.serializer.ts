import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@bechara/nestjs-core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class OrmEntitySerializer implements NestInterceptor {

  /**
   * If returning data contain entity classes, calls their stringify method
   * to prevent sending private data or exceeding call stack size.
   * @param context
   * @param next
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        map((data) => this.stringifyEntities(data)),
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

      for (const d of data) {
        this.eliminateRecursion(d.id, d);
      }
    }

    // Paginated entity
    if (data.records && Array.isArray(data.records)) {
      data.records = data.records.map((d) => d?.toJSON ? d.toJSON() : d);

      for (const d of data.records) {
        this.eliminateRecursion(d.id, d);
      }
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
    if (!data || !parentId) return;

    if (Array.isArray(data)) {
      for (const d of data) {
        this.eliminateRecursion(parentId, d);
      }
    }
    else if (typeof data === 'object') {
      for (const key in data) {
        if (typeof data[key] === 'object') {
          this.eliminateRecursion(parentId, data[key]);
        }
        else if (key !== 'id' && data[key] === parentId) {
          delete data[key];
        }
      }
    }
  }

}
