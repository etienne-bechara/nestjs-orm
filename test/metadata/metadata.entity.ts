import { uuidV4 } from '@bechara/nestjs-core';
import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { OrmBaseEntity } from '../../source/orm/orm.entity';
import { User } from '../user/user.entity';

@Entity({ tableName: 'metadata' })
export class Metadata extends OrmBaseEntity {

  @PrimaryKey()
  public id: string = uuidV4();

  @Property()
  public key: string;

  @Property()
  public value: string;

  @ManyToOne(() => User, { hidden: true })
  public user: User;

}
