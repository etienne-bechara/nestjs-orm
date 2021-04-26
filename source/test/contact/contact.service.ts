import { Injectable } from '@bechara/nestjs-core';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { OrmService } from '../../orm/orm.service';
import { ContactEntity } from './contact.entity';

@Injectable()
export class ContactService extends OrmService<ContactEntity> {

  public constructor(
    @InjectRepository(ContactEntity)
    private readonly contactRepository: EntityRepository<ContactEntity>,
  ) {
    super(contactRepository, {
      defaultUniqueKey: [ 'value' ],
      defaultPopulate: [ 'person' ],
    });
  }

}
