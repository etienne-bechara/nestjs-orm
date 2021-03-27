import { Collection, Entity, ManyToMany, Property, Unique } from '@mikro-orm/core';

import { OrmUuidEntity } from '../../orm/orm.entity';
import { CompanyEntity } from '../company/company.entity';

@Entity({ tableName: 'user' })
@Unique({ properties: [ 'name' ] })
export class UserEntity extends OrmUuidEntity {

  @Property()
  public name: string;

  @Property()
  public age: number;

  @Property({ columnType: 'float' })
  public capital: number;

  @Property({ nullable: true })
  public preferences: Record<string, any>;

  @ManyToMany(() => CompanyEntity, company => company.employees)
  public employers = new Collection<CompanyEntity>(this);

}
