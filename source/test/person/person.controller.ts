import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@bechara/nestjs-core';

import { OrmPagination } from '../../orm/orm.interface';
import { PersonCreateDto, PersonReadDto, PersonUpdateDto } from './person.dto';
import { Person } from './person.entity';
import { PersonRepository } from './person.repository';

@Controller('person')
export class PersonController {

  public constructor(
    private readonly personRepository: PersonRepository,
  ) { }

  @Get()
  public get(@Query() query: PersonReadDto): Promise<OrmPagination<Person>> {
    const { params, options } = this.personRepository.getReadArguments(query);
    return this.personRepository.readAndCount(params, options);
  }

  @Get(':id')
  public getById(@Param('id') id: string): Promise<Person> {
    return this.personRepository.readByIdOrFail(id, { populate: [ 'contacts' ] });
  }

  @Post()
  public post(@Body() body: PersonCreateDto): Promise<Person> {
    return this.personRepository.insertOne(body);
  }

  @Put()
  public put(@Body() body: PersonCreateDto): Promise<Person> {
    return this.personRepository.upsertOne(body);
  }

  @Put(':id')
  public putById(@Param('id') id: string, @Body() body: PersonCreateDto): Promise<Person> {
    return this.personRepository.updateById(id, body);
  }

  @Patch(':id')
  public patchById(@Param('id') id: string, @Body() body: PersonUpdateDto): Promise<Person> {
    return this.personRepository.updateById(id, body);
  }

  @Delete(':id')
  public deleteById(@Param('id') id: string): Promise<Person> {
    return this.personRepository.deleteById(id);
  }

}
