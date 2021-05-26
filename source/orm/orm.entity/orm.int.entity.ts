import { PrimaryKey } from '@mikro-orm/core';

import { OrmBaseEntity } from './orm.base.entity';
import { OrmTimestampEntity } from './orm.timestamp.entity';

export abstract class OrmIntEntity extends OrmBaseEntity {

  @PrimaryKey()
  public id: number;

}

export abstract class OrmIntTimestampEntity extends OrmTimestampEntity {

  @PrimaryKey()
  public id: number;

}
