import { Controller } from '@nestjs/common';

import { OrmController } from '../../orm/orm.controller';
import { OrmControllerMethod } from '../../orm/orm.enum';
import { UserCreateDto, UserReadDto, UserUpdateDto } from './user.dto';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController extends OrmController<UserEntity> {

  public constructor(
    private readonly userService: UserService,
  ) {
    super(userService, {
      routes: [
        { method: OrmControllerMethod.GET, queryDto: UserReadDto },
        { method: OrmControllerMethod.GET_BY_ID, queryDto: UserReadDto },
        { method: OrmControllerMethod.POST, bodyDto: UserCreateDto },
        { method: OrmControllerMethod.PUT, bodyDto: UserCreateDto },
        { method: OrmControllerMethod.PUT_BY_ID, bodyDto: UserUpdateDto },
        { method: OrmControllerMethod.DELETE_BY_ID },
      ],
    });
  }

}
