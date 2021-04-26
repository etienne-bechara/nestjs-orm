import { Injectable } from '@bechara/nestjs-core';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { OrmService } from '../../orm/orm.service';
import { PersonEntity } from './person.entity';

@Injectable()
export class PersonService extends OrmService<PersonEntity> {

  public constructor(
    @InjectRepository(PersonEntity)
    private readonly userRepository: EntityRepository<PersonEntity>,
  ) {
    super(userRepository, {
      defaultUniqueKey: [ 'name' ],
      defaultPopulate: [ ],
    });
  }

}
