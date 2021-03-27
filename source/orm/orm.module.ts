import { AppConfig, AppEnvironment, LoggerService, UtilModule } from '@bechara/nestjs-core';
import { MikroORMOptions } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DynamicModule, Module } from '@nestjs/common';

import { SchemaModuleOptions } from '../schema/schema.interface';
import { SchemaModule } from '../schema/schema.module';
import { OrmIdEntity, OrmTimestampEntity, OrmUuidEntity } from './orm.entity';
import { OrmInjectionToken } from './orm.enum';
import { OrmAsyncModuleOptions, OrmModuleOptions } from './orm.interface';

@Module({ })
export class OrmModule {

  /**
   * Configure the underlying ORM component with the following additions:
   * • Adds built-in logger service for debugging (local only)
   * • Adds programmatically schema sync.
   * @param options
   */
  public static registerAsync(options: OrmAsyncModuleOptions): DynamicModule {
    const entities = options.disableEntityScan
      ? options.entities || [ ]
      : UtilModule.globRequire([ 's*rc*/**/*.entity.ts', '!**/orm*entity.ts' ]);

    const rootEntities = [
      OrmIdEntity,
      OrmUuidEntity,
      OrmTimestampEntity,
      ...entities,
    ];

    return {
      module: OrmModule,
      imports: [
        MikroOrmModule.forRootAsync({
          inject: [ OrmInjectionToken.ORM_PROVIDER_OPTIONS ],
          useFactory: (mikroOrmOptions: OrmModuleOptions) => ({ ...mikroOrmOptions }),
        }),

        SchemaModule.registerAsync({
          inject: [ OrmInjectionToken.ORM_SCHEMA_OPTIONS ],
          useFactory: (schemaModuleOptions: SchemaModuleOptions) => ({ ...schemaModuleOptions }),
        }),

        MikroOrmModule.forFeature({ entities }),
      ],
      providers: [
        AppConfig,
        {
          provide: OrmInjectionToken.ORM_MODULE_OPTIONS,
          inject: options.inject || [ ],
          useFactory: options.useFactory,
        },
        {
          provide: OrmInjectionToken.ORM_PROVIDER_OPTIONS,
          inject: [ OrmInjectionToken.ORM_MODULE_OPTIONS, LoggerService, AppConfig ],
          useFactory: (
            ormModuleOptions: OrmModuleOptions,
            loggerService: LoggerService,
            appConfig: AppConfig,
          ): MikroORMOptions => ({
            type: ormModuleOptions.type,
            host: ormModuleOptions.host,
            port: ormModuleOptions.port,
            dbName: ormModuleOptions.database,
            user: ormModuleOptions.username,
            password: ormModuleOptions.password,
            debug: appConfig.NODE_ENV === AppEnvironment.LOCAL,
            logger: (msg): void => loggerService.debug(`[OrmService] ${msg}`),
            entities: rootEntities,
            ...ormModuleOptions.extras,
          } as any),
        },
        {
          provide: OrmInjectionToken.ORM_SCHEMA_OPTIONS,
          inject: [ OrmInjectionToken.ORM_MODULE_OPTIONS ],
          useFactory: (ormModuleOptions: OrmModuleOptions): SchemaModuleOptions => ({
            safeSync: ormModuleOptions.safeSync,
            schemaSync: ormModuleOptions.schemaSync,
          }),
        },
      ],
      exports: [
        OrmInjectionToken.ORM_PROVIDER_OPTIONS,
        OrmInjectionToken.ORM_SCHEMA_OPTIONS,
        MikroOrmModule.forFeature({ entities }),
      ],
    };
  }

}
