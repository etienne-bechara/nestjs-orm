import { EntityManager, EntityName, Repository } from '@mikro-orm/core';

import { OrmRepository } from '../../orm/orm.repository';
import { Company } from './company.entity';

@Repository(Company)
export class CompanyRepository extends OrmRepository<Company> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Company>,
  ) {
    super(entityManager, entityName, {
      displayName: 'company',
      defaultUniqueKey: [ 'name' ],
      defaultPopulate: [ 'headquarter', 'branches' ],
    });
  }

}
