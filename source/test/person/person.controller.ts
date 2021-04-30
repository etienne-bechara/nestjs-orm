/* eslint-disable jsdoc/require-jsdoc */
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@bechara/nestjs-core';

import { OrmController } from '../../orm/orm.controller';
import { OrmPagination } from '../../orm/orm.interface';
import { PersonCreateDto, PersonReadDto, PersonUpdateDto } from './person.dto';
import { PersonEntity } from './person.entity';
import { PersonService } from './person.service';

@Controller('person')
export class PersonController extends OrmController<PersonEntity> {

  public constructor(
    private readonly personService: PersonService,
  ) {
    super(personService);
  }

  @Get()
  public async get(@Query() query: PersonReadDto): Promise<OrmPagination<PersonEntity>> {
    const { params, options } = this.getReadArguments(query);
    return this.entityService.readAndCount(params, options);
  }

  @Get(':id')
  public async getById(@Param('id') id: string): Promise<PersonEntity> {
    return this.entityService.readByIdOrFail(id);
  }

  @Post()
  public async post(@Body() body: PersonCreateDto): Promise<PersonEntity> {
    return this.entityService.createOne(body);
  }

  @Put()
  public async put(@Body() body: PersonCreateDto): Promise<PersonEntity> {
    return this.entityService.upsertOne(body);
  }

  @Put(':id')
  public async putById(@Param('id') id: string, @Body() body: PersonCreateDto): Promise<PersonEntity> {
    return this.entityService.updateById(id, body);
  }

  @Patch(':id')
  public async patchById(@Param('id') id: string, @Body() body: PersonUpdateDto): Promise<PersonEntity> {
    return this.entityService.updateById(id, body);
  }

  @Delete(':id')
  public async deleteById(@Param('id') id: string): Promise<PersonEntity> {
    return this.entityService.removeById(id);
  }

}