import { Controller } from '@bechara/nestjs-core';

import { OrmController } from '../../orm/orm.controller';
import { CompanyCreateDto, CompanyReadDto, CompanyUpdateDto } from './company.dto';
import { CompanyEntity } from './company.entity';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController extends OrmController<CompanyEntity> {

  public constructor(
    private readonly companyService: CompanyService,
  ) {
    super(companyService, {
      methods: [ 'GET', 'GET:id', 'POST', 'PUT', 'PUT:id', 'PATCH:id', 'DELETE:id' ],
      dto: { read: CompanyReadDto, create: CompanyCreateDto, update: CompanyUpdateDto },
      populate: [ 'employees' ],
    });
  }

}
