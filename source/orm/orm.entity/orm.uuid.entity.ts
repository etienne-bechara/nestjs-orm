import { uuidV4 } from '@bechara/nestjs-core';
import { PrimaryKey } from '@mikro-orm/core';

import { OrmBaseEntity } from './orm.base.entity';
import { OrmTimestampEntity } from './orm.timestamp.entity';

export abstract class OrmUuidEntity extends OrmBaseEntity {

  @PrimaryKey({ length: 36 })
  public id: string = uuidV4();

}

export abstract class OrmUuidTimestampEntity extends OrmTimestampEntity {

  @PrimaryKey({ length: 36 })
  public id: string = uuidV4();

}
