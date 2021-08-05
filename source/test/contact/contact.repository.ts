import { EntityManager, EntityName, Repository } from '@mikro-orm/core';

import { OrmRepository } from '../../orm/orm.repository';
import { Contact } from './contact.entity';

@Repository(Contact)
export class ContactRepository extends OrmRepository<Contact> {

  public constructor(
    protected readonly entityManager: EntityManager,
    protected readonly entityName: EntityName<Contact>,
  ) {
    super(entityManager, entityName, {
      displayName: 'contact',
      defaultUniqueKey: [ 'value' ],
      defaultPopulate: [ 'person' ],
    });
  }

}
