import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { OrmReadOptions } from '../../orm/orm.interface';
import { OrmService } from '../../orm/orm.service';
import { CompanyEntity } from './company.entity';

@Injectable()
export class CompanyService extends OrmService<CompanyEntity> {

  public constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: EntityRepository<CompanyEntity>,
  ) {
    super(companyRepository, {
      uniqueKey: [ 'name' ],
      populate: [ 'employees', 'parent' ],
    });
  }

  /**
   * When reading a single entity also populate the children.
   * @param id
   * @param options
   */
  public async readById(id: string, options: OrmReadOptions<CompanyEntity> = { }): Promise<CompanyEntity> {
    options.populate = [ 'employees', 'parent', 'children' ];
    return super.readById(id, options);
  }

}
