/* eslint-disable jsdoc/require-jsdoc */
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@bechara/nestjs-core';

import { OrmController } from '../../orm/orm.controller';
import { OrmPagination } from '../../orm/orm.interface';
import { CompanyCreateDto, CompanyReadDto, CompanyUpdateDto } from './company.dto';
import { CompanyEntity } from './company.entity';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController extends OrmController<CompanyEntity> {

  public constructor(
    private readonly companyService: CompanyService,
  ) {
    super(companyService);
  }

  @Get()
  public async get(@Query() query: CompanyReadDto): Promise<OrmPagination<CompanyEntity>> {
    const { params, options } = this.getReadArguments(query);
    return this.entityService.readAndCount(params, options);
  }

  @Get(':id')
  public async getById(@Param('id') id: string): Promise<CompanyEntity> {
    return this.entityService.readByIdOrFail(id);
  }

  @Post()
  public async post(@Body() body: CompanyCreateDto): Promise<CompanyEntity> {
    return this.entityService.createOne(body);
  }

  @Put()
  public async put(@Body() body: CompanyCreateDto): Promise<CompanyEntity> {
    return this.entityService.upsertOne(body);
  }

  @Put(':id')
  public async putById(@Param('id') id: string, @Body() body: CompanyCreateDto): Promise<CompanyEntity> {
    return this.entityService.updateById(id, body);
  }

  @Patch(':id')
  public async patchById(@Param('id') id: string, @Body() body: CompanyUpdateDto): Promise<CompanyEntity> {
    return this.entityService.updateById(id, body);
  }

  @Delete(':id')
  public async deleteById(@Param('id') id: string): Promise<CompanyEntity> {
    return this.entityService.removeById(id);
  }

}