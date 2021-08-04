import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@bechara/nestjs-core';

import { OrmPagination } from '../../orm/orm.interface';
import { ContactCreateDto, ContactReadDto, ContactUpdateDto } from './contact.dto';
import { Contact } from './contact.entity';
import { ContactRepository } from './contact.repository';

@Controller('contact')
export class ContactController {

  public constructor(
    private readonly contactRepository: ContactRepository,
  ) { }

  @Get()
  public get(@Query() query: ContactReadDto): Promise<OrmPagination<Contact>> {
    const { params, options } = this.contactRepository.getReadArguments(query);
    return this.contactRepository.readAndCount(params, options);
  }

  @Get(':id')
  public getById(@Param('id') id: string): Promise<Contact> {
    return this.contactRepository.readByIdOrFail(id);
  }

  @Post()
  public post(@Body() body: ContactCreateDto): Promise<Contact> {
    return this.contactRepository.insertOne(body);
  }

  @Put()
  public put(@Body() body: ContactCreateDto): Promise<Contact> {
    return this.contactRepository.upsertOne(body);
  }

  @Put(':id')
  public putById(@Param('id') id: string, @Body() body: ContactCreateDto): Promise<Contact> {
    return this.contactRepository.updateById(id, body);
  }

  @Patch(':id')
  public patchById(@Param('id') id: string, @Body() body: ContactUpdateDto): Promise<Contact> {
    return this.contactRepository.updateById(id, body);
  }

  @Delete(':id')
  public deleteById(@Param('id') id: string): Promise<Contact> {
    return this.contactRepository.deleteById(id);
  }

}
