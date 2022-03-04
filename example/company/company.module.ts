import { Module } from '@bechara/nestjs-core';

import { CompanyController } from './company.controller';

@Module({
  controllers: [
    CompanyController,
  ],
})
export class CompanyModule { }
