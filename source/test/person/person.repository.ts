import { EntityManager, EntityName, Repository } from '@mikro-orm/core';

import { OrmRepository } from '../../orm/orm.repository';
import { Person } from './person.entity';

@Repository(Person)
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
