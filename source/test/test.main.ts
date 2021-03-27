import { AppModule } from '@bechara/nestjs-core';

import { CompanyModule } from './company/company.module';
import { DatabaseConfig } from './database/database.config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';

void AppModule.bootServer({
  disableConfigScan: true,
  disableModuleScan: true,
  modules: [
    DatabaseModule,
    CompanyModule,
    UserModule,
  ],
  configs: [
    DatabaseConfig,
  ],
});
