import { PrimaryKey } from '@mikro-orm/core';

import { OrmTimestampEntity } from './orm.timestamp.entity';

export abstract class OrmIdEntity extends OrmTimestampEntity {

  @PrimaryKey()
  public id: number;

}
