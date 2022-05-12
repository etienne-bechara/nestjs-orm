import { IsIn, IsNumberString } from '@bechara/nestjs-core';
import { Entity, Enum, OneToOne, Property } from '@mikro-orm/core';

import { OrmBaseEntity } from '../../source/orm/orm.entity';
import { User } from '../user/user.entity';
import { AddressState } from './address.enum';
import { AddressRepository } from './address.repository';

@Entity({ customRepository: () => AddressRepository })
export class Address extends OrmBaseEntity {

  @OneToOne(() => User, null, { primary: true })
  public user: User;

  @Property()
  @IsNumberString()
  public zip: string;

  @Enum(() => AddressState)
  @IsIn(Object.values(AddressState))
  public state: AddressState;

}
