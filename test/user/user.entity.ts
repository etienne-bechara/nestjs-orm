import { IsEmail, IsNumber, IsOptional, IsString } from '@bechara/nestjs-core';
import { Collection, Entity, OneToMany, OneToOne, Property, Unique } from '@mikro-orm/core';

import { OrmUuidTimestampEntity } from '../../source/orm/orm.entity';
import { Address } from '../address/address.entity';
import { Metadata } from '../metadata/metadata.entity';
import { Order } from '../order/order.entity';
import { UserRepository } from './user.repository';

@Entity({ customRepository: () => UserRepository })
@Unique({ properties: [ 'name' ] })
export class User extends OrmUuidTimestampEntity {

  @IsString()
  @Property()
  public name: string;

  @Property()
  @IsNumber()
  public age: number;

  @Property({ nullable: true })
  @IsOptional()
  @IsEmail()
  public email: string;

  @OneToOne(() => Address, 'user', { orphanRemoval: true })
  public address: Address;

  @OneToMany(() => Order, 'user')
  public orders = new Collection<Order>(this);

  @OneToMany(() => Metadata, 'user', { orphanRemoval: true })
  public metadata = new Collection<Metadata>(this);

}
