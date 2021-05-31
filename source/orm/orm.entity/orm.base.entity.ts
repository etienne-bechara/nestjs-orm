/* eslint-disable @typescript-eslint/naming-convention */
import { AnyEntity, BaseEntity, wrap } from '@mikro-orm/core';

export abstract class OrmBaseEntity extends BaseEntity<AnyEntity, 'id'> {

  /**
   * Extendable hook to apply custom steps before serialization.
   * @param object
   */
  protected beforeSerialization(object: any): any {
    return object;
  }

  /**
   * Overwrites built-in serialization method to add hook.
   * @param args
   */
  public toJSON(...args: any[]): any {
    const object = wrap(this, true).toObject(...args);
    return this.beforeSerialization(object);
  }

}
