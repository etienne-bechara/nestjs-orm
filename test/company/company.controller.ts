import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@bechara/nestjs-core';

import { OrmPagination } from '../../source/orm/orm.interface';
import { CompanyCreateDto, CompanyReadDto, CompanyUpdateDto } from './company.dto';
import { Company } from './company.entity';
import { CompanyRepository } from './company.repository';

@Controller('company')
export class CompanyController {

  public constructor(
    private readonly companyRepository: CompanyRepository,
  ) { }

  @Get()
  public get(@Query() query: CompanyReadDto): Promise<OrmPagination<Company>> {
    const { params, options } = this.companyRepository.getReadArguments(query);
    return this.companyRepository.readAndCount(params, options);
  }

  @Get(':id')
  public getById(@Param('id') id: string): Promise<Company> {
    return this.companyRepository.readByIdOrFail(id);
  }

  @Post()
  public post(@Body() body: CompanyCreateDto): Promise<Company> {
    return this.companyRepository.insertOne(body);
  }

  @Put()
  public put(@Body() body: CompanyCreateDto): Promise<Company> {
    return this.companyRepository.upsertOne(body);
  }

  @Put(':id')
  public putById(@Param('id') id: string, @Body() body: CompanyCreateDto): Promise<Company> {
    return this.companyRepository.updateById(id, body);
  }

  @Patch(':id')
  public patchById(@Param('id') id: string, @Body() body: CompanyUpdateDto): Promise<Company> {
    return this.companyRepository.updateById(id, body);
  }

  @Delete(':id')
  public deleteById(@Param('id') id: string): Promise<Company> {
    return this.companyRepository.deleteById(id);
  }

}
