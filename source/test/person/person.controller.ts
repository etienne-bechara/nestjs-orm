import { Controller } from '@bechara/nestjs-core';

import { OrmController } from '../../orm/orm.controller';
import { OrmControllerMethod } from '../../orm/orm.enum';
import { PersonCreateDto, PersonReadDto, PersonUpdateDto } from './person.dto';
import { PersonEntity } from './person.entity';
import { PersonService } from './person.service';

@Controller('person')
export class PersonController extends OrmController<PersonEntity> {

  public constructor(
    private readonly userService: PersonService,
  ) {
    super(userService, {
      routes: [
        { method: OrmControllerMethod.GET, queryDto: PersonReadDto },
        { method: OrmControllerMethod.GET_BY_ID, queryDto: PersonReadDto },
        { method: OrmControllerMethod.POST, bodyDto: PersonCreateDto },
        { method: OrmControllerMethod.PUT, bodyDto: PersonCreateDto },
        { method: OrmControllerMethod.PUT_BY_ID, bodyDto: PersonUpdateDto },
        { method: OrmControllerMethod.DELETE_BY_ID },
      ],
    });
  }

}
