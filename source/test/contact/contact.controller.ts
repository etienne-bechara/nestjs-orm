import { Controller } from '@bechara/nestjs-core';

import { OrmController } from '../../orm/orm.controller';
import { ContactCreateDto, ContactReadDto, ContactUpdateDto } from './contact.dto';
import { ContactEntity } from './contact.entity';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController extends OrmController<ContactEntity> {

  public constructor(
    private readonly contactService: ContactService,
  ) {
    super(contactService, {
      methods: [ 'GET', 'GET:id', 'POST', 'PUT', 'PUT:id', 'PATCH:id', 'DELETE:id' ],
      dto: { read: ContactReadDto, create: ContactCreateDto, update: ContactUpdateDto },
    });
  }

}
