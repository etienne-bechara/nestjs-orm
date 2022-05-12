import { PartialType, PickType } from '@bechara/nestjs-core';

import { User } from './user.entity';

export class UserReadDto extends PartialType(PickType(User, [ 'name', 'email' ])) { }

export class UserCreateDto extends PickType(User, [ 'name', 'age', 'email' ]) { }

export class UserUpdateDto extends PartialType(UserCreateDto) { }
