import { EntityManager, EntityName } from '@mikro-orm/core';

import { OrmRepository } from '../../source/orm/orm.repository';
import { Person } from './person.entity';

export class PersonRepository extends OrmRepository<Person> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Person>,
  ) {
    super(entityManager, entityName, {
      displayName: 'person',
      defaultUniqueKey: [ 'name', 'surname' ],
    });
  }

}
