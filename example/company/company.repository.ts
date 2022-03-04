import { EntityManager, EntityName } from '@mikro-orm/core';

import { OrmRepository } from '../../source/orm/orm.repository';
import { Company } from './company.entity';

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
