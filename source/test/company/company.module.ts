import { Module } from '@bechara/nestjs-core';

import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  controllers: [ CompanyController ],
  providers: [ CompanyService ],
  exports: [ CompanyService ],
})
export class CompanyModule { }
