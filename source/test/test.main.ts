import { AppModule } from '@bechara/nestjs-core';

import { OrmConfig } from '../orm/orm.config';
import { OrmModule } from '../orm/orm.module';
import { CompanyEntity } from './company/company.entity';
import { CompanyModule } from './company/company.module';
import { UserEntity } from './user/user.entity';
import { UserModule } from './user/user.module';

void AppModule.bootServer({
  disableConfigScan: true,
  disableModuleScan: true,
  configs: [ OrmConfig ],
  modules: [ CompanyModule, UserModule ],
  imports: [
    OrmModule.registerAsync({
      disableEntityScan: true,
      entities: [ CompanyEntity, UserEntity ],
      inject: [ OrmConfig ],
      useFactory: (ormConfig: OrmConfig) => ({
        type: ormConfig.ORM_TYPE,
        host: ormConfig.ORM_HOST,
        port: ormConfig.ORM_PORT,
        database: ormConfig.ORM_DATABASE,
        username: ormConfig.ORM_USERNAME,
        password: ormConfig.ORM_PASSWORD,
        schemaSync: ormConfig.ORM_SYNC_SCHEMA,
        safeSync: ormConfig.ORM_SYNC_SAFE,
      }),
    }),
  ],
  providers: [ OrmConfig ],
  exports: [ OrmConfig, OrmModule ],
});
