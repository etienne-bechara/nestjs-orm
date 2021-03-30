import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core';

import { OrmUuidEntity } from '../../orm/orm.entity';
import { PersonEntity } from '../person/person.entity';
import { ContactType } from './contact.enum';

@Entity({ tableName: 'contact' })
@Unique({ properties: [ 'value' ] })
export class ContactEntity extends OrmUuidEntity {

  @Enum(() => ContactType)
  public type: ContactType;

  @Property()
  public value: string;

  @Property()
  public primary: boolean = false;

  @ManyToOne(() => PersonEntity)
  public person: PersonEntity;

}
