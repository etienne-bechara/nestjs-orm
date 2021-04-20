import { AppEnvironment, AppModule } from '@bechara/nestjs-core';

import { OrmConfig } from '../orm/orm.config';
import { OrmModule } from '../orm/orm.module';
import { CompanyEntity } from './company/company.entity';
import { CompanyModule } from './company/company.module';
import { ContactEntity } from './contact/contact.entity';
import { ContactModule } from './contact/contact.module';
import { PersonEntity } from './person/person.entity';
import { PersonModule } from './person/person.module';
import { StartupModule } from './startup/startup.module';

void AppModule.bootServer({
  disableConfigScan: true,
  disableModuleScan: true,
  configs: [
    OrmConfig,
  ],
  modules: [
    ContactModule,
    CompanyModule,
    PersonModule,
    StartupModule,
  ],
  imports: [
    OrmModule.registerAsync({
      disableEntityScan: true,
      entities: [
        ContactEntity,
        CompanyEntity,
        PersonEntity,
      ],
      inject: [ OrmConfig ],
      useFactory: (ormConfig: OrmConfig) => ({
        type: ormConfig.ORM_TYPE,
        host: ormConfig.ORM_HOST,
        port: ormConfig.ORM_PORT,
        database: ormConfig.ORM_DATABASE,
        username: ormConfig.ORM_USERNAME,
        password: ormConfig.ORM_PASSWORD,
        sync: {
          enable: true,
          safe: ormConfig.NODE_ENV === AppEnvironment.PRODUCTION,
        },
      }),
    }),
  ],
  providers: [
    OrmConfig,
  ],
  exports: [
    OrmConfig,
    OrmModule,
  ],
});
