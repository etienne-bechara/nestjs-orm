import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@bechara/nestjs-core';

import { OrmController } from '../../orm/orm.controller';
import { OrmPagination } from '../../orm/orm.interface';
import { ContactCreateDto, ContactReadDto, ContactUpdateDto } from './contact.dto';
import { ContactEntity } from './contact.entity';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController extends OrmController<ContactEntity> {

  public constructor(
    private readonly contactService: ContactService,
  ) {
    super(contactService);
  }

  @Get()
  public async get(@Query() query: ContactReadDto): Promise<OrmPagination<ContactEntity>> {
    const { params, options } = this.getReadArguments(query);
    return this.entityService.readAndCount(params, options);
  }

  @Get(':id')
  public async getById(@Param('id') id: string): Promise<ContactEntity> {
    return this.entityService.readByIdOrFail(id);
  }

  @Post()
  public async post(@Body() body: ContactCreateDto): Promise<ContactEntity> {
    return this.entityService.createOne(body);
  }

  @Put()
  public async put(@Body() body: ContactCreateDto): Promise<ContactEntity> {
    return this.entityService.upsertOne(body);
  }

  @Put(':id')
  public async putById(@Param('id') id: string, @Body() body: ContactCreateDto): Promise<ContactEntity> {
    return this.entityService.updateById(id, body);
  }

  @Patch(':id')
  public async patchById(@Param('id') id: string, @Body() body: ContactUpdateDto): Promise<ContactEntity> {
    return this.entityService.updateById(id, body);
  }

  @Delete(':id')
  public async deleteById(@Param('id') id: string): Promise<ContactEntity> {
    return this.entityService.removeById(id);
  }

}
