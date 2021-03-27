import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/core';

import { OrmUuidEntity } from '../../orm/orm.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ tableName: 'company' })
@Unique({ properties: [ 'name' ] })
export class CompanyEntity extends OrmUuidEntity {

  @Property()
  public name: string;

  @ManyToMany(() => UserEntity, user => user.employers, { owner: true, pivotTable: 'company_employee' })
  public employees = new Collection<UserEntity>(this);

  @ManyToOne(() => CompanyEntity, { nullable: true })
  public parent: CompanyEntity;

  @OneToMany(() => CompanyEntity, company => company.parent)
  public children = new Collection<UserEntity>(this);

}
