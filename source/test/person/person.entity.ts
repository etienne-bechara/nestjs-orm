import { Collection, Entity, ManyToMany, OneToMany, Property, Unique } from '@mikro-orm/core';

import { OrmUuidTimestampEntity } from '../../orm/orm.entity';
import { CompanyEntity } from '../company/company.entity';
import { ContactEntity } from '../contact/contact.entity';

@Entity({ tableName: 'person' })
@Unique({ properties: [ 'name' ] })
export class PersonEntity extends OrmUuidTimestampEntity {

  @Property()
  public name: string;

  @Property()
  public age: number;

  @Property({ columnType: 'float' })
  public height: number;

  @Property({ columnType: 'float' })
  public weight: number;

  @Property({ nullable: true })
  public preferences: Record<string, any>;

  @OneToMany(() => ContactEntity, contact => contact.person)
  public contacts = new Collection<ContactEntity>(this);

  @ManyToMany(() => CompanyEntity, company => company.employees)
  public employers = new Collection<CompanyEntity>(this);

}
