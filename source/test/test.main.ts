import { AppEnvironment, AppModule } from '@bechara/nestjs-core';

import { OrmConfig } from '../orm/orm.config';
import { OrmModule } from '../orm/orm.module';
import { Company } from './company/company.entity';
import { CompanyModule } from './company/company.module';
import { Contact } from './contact/contact.entity';
import { ContactModule } from './contact/contact.module';
import { Person } from './person/person.entity';
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
          enable: true,
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
  ],
  providers: [
    OrmConfig,
  ],
  exports: [
    OrmConfig,
    OrmModule,
  ],
});
