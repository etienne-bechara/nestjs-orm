import { PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';

import { OrmBaseEntity } from './orm.base.entity';
import { OrmTimestampEntity } from './orm.timestamp.entity';

export abstract class OrmUuidEntity extends OrmBaseEntity {

  @PrimaryKey({ length: 36 })
  public id: string = v4();

}

export abstract class OrmUuidTimestampEntity extends OrmTimestampEntity {

  @PrimaryKey({ length: 36 })
  public id: string = v4();

}
