import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@bechara/nestjs-core';

import { UserCreateDto, UserPagination, UserReadDto, UserUpdateDto } from './user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Controller('user')
export class UserController {

  public constructor(
    private readonly userRepository: UserRepository,
  ) { }

  @Get({
    response: { type: UserPagination },
  })
  public get(@Query() query: UserReadDto): Promise<UserPagination> {
    return this.userRepository.readPaginatedBy(query);
  }

  @Get(':id', {
    response: { type: User },
  })
  public getById(@Param('id') id: string): Promise<User> {
    const populate = [ 'address' ];
    return this.userRepository.readByIdOrFail(id, { populate });
  }

  @Post({
    response: { type: User },
  })
  public post(@Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.createOne(body);
  }

  @Put({
    response: { type: User },
  })
  public put(@Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.upsertOne(body);
  }

  @Put(':id', {
    response: { type: User },
  })
  public putById(@Param('id') id: string, @Body() body: UserCreateDto): Promise<User> {
    return this.userRepository.updateById(id, body);
  }

  @Patch(':id', {
    response: { type: User },
  })
  public patchById(@Param('id') id: string, @Body() body: UserUpdateDto): Promise<User> {
    return this.userRepository.updateById(id, body);
  }

  @Delete(':id', {
    response: { type: User },
  })
  public deleteById(@Param('id') id: string): Promise<User> {
    return this.userRepository.deleteById(id);
  }

}
