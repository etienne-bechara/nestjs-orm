import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { OrmService } from '../../orm/orm.service';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService extends OrmService<UserEntity> {

  public constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: EntityRepository<UserEntity>,
  ) {
    super(userRepository, {
      uniqueKey: [ 'name' ],
      populate: [ 'employers' ],
    });
  }

}
