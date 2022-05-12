import { IsObject, PartialType, PickType } from '@bechara/nestjs-core';

import { OrmPagination } from '../../source/orm/orm.dto';
import { User } from './user.entity';

export class UserReadDto extends PartialType(PickType(User, [ 'name', 'email' ])) { }

export class UserCreateDto extends PickType(User, [ 'name', 'age', 'email' ]) { }

export class UserUpdateDto extends PartialType(UserCreateDto) { }

export class UserPagination extends OrmPagination<User> {

  @IsObject(User, { each: true })
  public records: User[];

}
