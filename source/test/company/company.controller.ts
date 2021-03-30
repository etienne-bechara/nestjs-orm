import { Controller } from '@bechara/nestjs-core';

import { OrmController } from '../../orm/orm.controller';
import { OrmControllerMethod } from '../../orm/orm.enum';
import { CompanyCreateDto, CompanyReadDto, CompanyUpdateDto } from './company.dto';
import { CompanyEntity } from './company.entity';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController extends OrmController<CompanyEntity> {

  public constructor(
    private readonly companyService: CompanyService,
  ) {
    super(companyService, {
      routes: [
        { method: OrmControllerMethod.GET, queryDto: CompanyReadDto },
        { method: OrmControllerMethod.GET_BY_ID, queryDto: CompanyReadDto },
        { method: OrmControllerMethod.POST, bodyDto: CompanyCreateDto },
        { method: OrmControllerMethod.PUT, bodyDto: CompanyCreateDto },
        { method: OrmControllerMethod.PUT_BY_ID, bodyDto: CompanyUpdateDto },
        { method: OrmControllerMethod.DELETE_BY_ID },
      ],
    });
  }

}
