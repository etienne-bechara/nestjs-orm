import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core';

import { OrmUuidTimestampEntity } from '../../source/orm/orm.entity';
import { Person } from '../person/person.entity';
import { ContactType } from './contact.enum';
import { ContactRepository } from './contact.repository';

@Entity({ customRepository: () => ContactRepository })
@Unique({ properties: [ 'value' ] })
export class Contact extends OrmUuidTimestampEntity {

  @Enum(() => ContactType)
  public type: ContactType;

  @Property()
  public value: string;

  @Property()
  public primary: boolean = false;

  @ManyToOne(() => Person)
  public person: Person;

}
