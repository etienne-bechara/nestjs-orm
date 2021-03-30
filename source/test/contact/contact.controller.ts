import { Controller } from '@bechara/nestjs-core';

import { OrmController } from '../../orm/orm.controller';
import { OrmControllerMethod } from '../../orm/orm.enum';
import { ContactCreateDto, ContactReadDto, ContactUpdateDto } from './contact.dto';
import { ContactEntity } from './contact.entity';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController extends OrmController<ContactEntity> {

  public constructor(
    private readonly contactService: ContactService,
  ) {
    super(contactService, {
      routes: [
        { method: OrmControllerMethod.GET, queryDto: ContactReadDto },
        { method: OrmControllerMethod.GET_BY_ID, queryDto: ContactReadDto },
        { method: OrmControllerMethod.POST, bodyDto: ContactCreateDto },
        { method: OrmControllerMethod.PUT, bodyDto: ContactCreateDto },
        { method: OrmControllerMethod.PUT_BY_ID, bodyDto: ContactUpdateDto },
        { method: OrmControllerMethod.DELETE_BY_ID },
      ],
    });
  }

}
