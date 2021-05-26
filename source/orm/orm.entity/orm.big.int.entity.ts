import { PrimaryKey } from '@mikro-orm/core';

import { OrmBaseEntity } from './orm.base.entity';
import { OrmTimestampEntity } from './orm.timestamp.entity';

export abstract class OrmBigIntEntity extends OrmBaseEntity {

  @PrimaryKey({ columnType: 'bigint' })
  public id: number;

}

export abstract class OrmBigIntTimestampEntity extends OrmTimestampEntity {

  @PrimaryKey({ columnType: 'bigint' })
  public id: number;

}
