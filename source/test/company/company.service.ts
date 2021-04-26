import { Injectable } from '@bechara/nestjs-core';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { OrmService } from '../../orm/orm.service';
import { CompanyEntity } from './company.entity';

@Injectable()
export class CompanyService extends OrmService<CompanyEntity> {

  public constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: EntityRepository<CompanyEntity>,
  ) {
    super(companyRepository, {
      defaultUniqueKey: [ 'name' ],
      defaultPopulate: [ 'headquarter', 'branches' ],
    });
  }

}
