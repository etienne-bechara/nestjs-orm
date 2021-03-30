import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/core';

import { OrmUuidEntity } from '../../orm/orm.entity';
import { PersonEntity } from '../person/person.entity';

@Entity({ tableName: 'company' })
@Unique({ properties: [ 'name' ] })
export class CompanyEntity extends OrmUuidEntity {

  @Property()
  public name: string;

  @ManyToOne(() => CompanyEntity, { nullable: true })
  public headquarter: CompanyEntity;

  @ManyToMany(() => PersonEntity, user => user.employers, { owner: true, pivotTable: 'company_employee' })
  public employees = new Collection<PersonEntity>(this);

  @OneToMany(() => CompanyEntity, company => company.headquarter)
  public branches = new Collection<PersonEntity>(this);

}
