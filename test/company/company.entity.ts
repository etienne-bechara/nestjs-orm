import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/core';

import { OrmUuidTimestampEntity } from '../../source/orm/orm.entity';
import { Person } from '../person/person.entity';
import { CompanyRepository } from './company.repository';

@Entity({ customRepository: () => CompanyRepository })
@Unique({ properties: [ 'name' ] })
export class Company extends OrmUuidTimestampEntity {

  @Property()
  public name: string;

  @Property()
  public capital: number;

  @ManyToOne(() => Company, { nullable: true })
  public headquarter: Company;

  @ManyToMany(() => Person, user => user.employers, { owner: true, pivotTable: 'company_employee' })
  public employees = new Collection<Person>(this);

  @OneToMany(() => Company, company => company.headquarter)
  public branches = new Collection<Person>(this);

}
