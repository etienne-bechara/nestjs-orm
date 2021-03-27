import { AnyEntity, BaseEntity, Index, Property } from '@mikro-orm/core';

export abstract class OrmTimestampEntity extends BaseEntity<AnyEntity, 'id'> {

  @Index()
  @Property({ columnType: 'timestamp', onUpdate: () => new Date(), nullable: true })
  public updated: Date = new Date();

  @Index()
  @Property({ columnType: 'timestamp', nullable: true })
  public created: Date = new Date();

}
