import { Controller } from '@bechara/nestjs-core';

import { OrmController } from '../../orm/orm.controller';
import { PersonCreateDto, PersonReadDto, PersonUpdateDto } from './person.dto';
import { PersonEntity } from './person.entity';
import { PersonService } from './person.service';

@Controller('person')
export class PersonController extends OrmController<PersonEntity> {

  public constructor(
    private readonly userService: PersonService,
  ) {
    super(userService, {
      methods: [ 'GET', 'GET:id', 'POST', 'PUT', 'PUT:id', 'PATCH:id', 'DELETE:id' ],
      dto: { read: PersonReadDto, create: PersonCreateDto, update: PersonUpdateDto },
      populate: [ 'contacts', 'employers.headquarter' ],
    });
  }

}
