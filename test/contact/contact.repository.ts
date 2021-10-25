import { EntityManager, EntityName } from '@mikro-orm/core';

import { OrmRepository } from '../../source/orm/orm.repository';
import { Contact } from './contact.entity';

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
