import { AppEnvironment, AppModule } from '@bechara/nestjs-core';

import { OrmConfig } from '../source/orm/orm.config';
import { OrmModule } from '../source/orm/orm.module';
import { Company } from './company/company.entity';
import { CompanyModule } from './company/company.module';
import { Contact } from './contact/contact.entity';
import { ContactModule } from './contact/contact.module';
import { Person } from './person/person.entity';
import { PersonModule } from './person/person.module';
import { StartupModule } from './startup/startup.module';

void AppModule.boot({
  disableConfigScan: true,
  disableModuleScan: true,
  configs: [
    OrmConfig,
  ],
  imports: [
    OrmModule.registerAsync({
      disableEntityScan: true,
      entities: [
        Contact,
        Company,
        Person,
      ],
      inject: [ OrmConfig ],
      useFactory: (ormConfig: OrmConfig) => ({
        type: ormConfig.ORM_TYPE,
        host: ormConfig.ORM_HOST,
        port: ormConfig.ORM_PORT,
        dbName: ormConfig.ORM_DATABASE,
        user: ormConfig.ORM_USERNAME,
        password: ormConfig.ORM_PASSWORD,
        pool: {
          min: 2,
          max: 25,
        },
        sync: {
          auto: true,
          controller: true,
          safe: ormConfig.NODE_ENV === AppEnvironment.PRODUCTION,
        },
        driverOptions: ormConfig.ORM_SERVER_CA
          ? {
            connection: {
              ssl: {
                ca: Buffer.from(ormConfig.ORM_SERVER_CA, 'base64'),
                cert: Buffer.from(ormConfig.ORM_CLIENT_CERTIFICATE, 'base64'),
                key: Buffer.from(ormConfig.ORM_CLIENT_KEY, 'base64'),
              },
            },
          }
          : undefined,
      }),
    }),
    ContactModule,
    CompanyModule,
    PersonModule,
    StartupModule,
  ],
  providers: [
    OrmConfig,
  ],
  exports: [
    OrmConfig,
    OrmModule,
    ContactModule,
    CompanyModule,
    PersonModule,
    StartupModule,
  ],
});
