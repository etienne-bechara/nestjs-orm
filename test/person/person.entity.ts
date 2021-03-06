import { Collection, Entity, ManyToMany, OneToMany, Property, Unique } from '@mikro-orm/core';

import { OrmUuidTimestampEntity } from '../../source/orm/orm.entity';
import { Company } from '../company/company.entity';
import { Contact } from '../contact/contact.entity';

@Entity()
@Unique({ properties: [ 'name', 'surname' ] })
export class Person extends OrmUuidTimestampEntity {

  @Property()
  public name: string;

  @Property()
  public surname: string;

  @Property()
  public age: number;

  @Property({ columnType: 'float' })
  public height: number;

  @Property({ columnType: 'float' })
  public weight: number;

  @Property({ nullable: true })
  public preferences: Record<string, any>;

  @OneToMany(() => Contact, contact => contact.person)
  public contacts = new Collection<Contact>(this);

  @ManyToMany(() => Company, company => company.employees)
  public employers = new Collection<Company>(this);

  /**
   * Join names.
   * @param person
   */
  protected beforeSerialization(person: Person): any {
    const output: any = { ...person };
    output.fullName = `${output.name} ${output.surname}`;
    delete output.name;
    delete output.surname;
    return output;
  }

}
