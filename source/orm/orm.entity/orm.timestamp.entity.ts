import { Index, Property } from '@mikro-orm/core';

import { OrmBaseEntity } from './orm.base.entity';

export abstract class OrmTimestampEntity extends OrmBaseEntity {

  @Index()
  @Property({ columnType: 'timestamp', onUpdate: () => new Date(), nullable: true })
  public updated: Date = new Date();

  @Index()
  @Property({ columnType: 'timestamp', nullable: true })
  public created: Date = new Date();

}
