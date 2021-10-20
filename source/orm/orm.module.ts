import { APP_INTERCEPTOR, AppConfig, AppEnvironment, ContextStorage, DynamicModule, LoggerService, Module, UtilModule } from '@bechara/nestjs-core';
import { EntityManager, MikroORMOptions } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { SchemaModuleOptions } from '../schema/schema.interface';
import { SchemaModule } from '../schema/schema.module';
import { OrmBaseEntity, OrmBigIntEntity, OrmBigIntTimestampEntity, OrmIntEntity, OrmIntTimestampEntity, OrmTimestampEntity, OrmUuidEntity, OrmUuidTimestampEntity } from './orm.entity';
import { OrmInjectionToken, OrmStoreKey } from './orm.enum';
import { OrmEntityManager } from './orm.interceptor';
import { OrmAsyncModuleOptions, OrmModuleOptions } from './orm.interface';

@Module({ })
export class OrmModule {

  /**
   * Configure the underlying ORM component with the following additions:
   * - Adds built-in logger service for debugging (local only)
   * - Adds programmatically schema sync.
   * @param options
   */
  public static registerAsync(options: OrmAsyncModuleOptions): DynamicModule {
    const entities = options.disableEntityScan
      ? options.entities || [ ]
      : UtilModule.globRequire([ 's*rc*/**/*.entity.{js,ts}' ]);

    const rootEntities = [
      OrmBaseEntity,
      OrmTimestampEntity,
      OrmIntEntity,
      OrmIntTimestampEntity,
      OrmBigIntEntity,
      OrmBigIntTimestampEntity,
      OrmUuidEntity,
      OrmUuidTimestampEntity,
      ...entities,
    ];

    return {
      module: OrmModule,

      imports: [
        MikroOrmModule.forRootAsync({
          inject: [ OrmInjectionToken.ORM_PROVIDER_OPTIONS ],
          useFactory: (mikroOrmOptions: OrmModuleOptions) => ({
            ...mikroOrmOptions,
            registerRequestContext: false,
            context: (): EntityManager => ContextStorage.getStore()?.get(OrmStoreKey.ENTITY_MANAGER),
          }),
        }),

        SchemaModule.registerAsync({
          inject: [ OrmInjectionToken.ORM_SCHEMA_OPTIONS ],
          useFactory: (syncModuleOptions: SchemaModuleOptions) => syncModuleOptions,
        }),

        MikroOrmModule.forFeature({ entities }),
      ],

      providers: [
        AppConfig,
        {
          provide: APP_INTERCEPTOR,
          useClass: OrmEntityManager,
        },
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
          ): MikroORMOptions => {
            const mikroOrmOptions: MikroORMOptions = { ...ormModuleOptions } as any;
            delete mikroOrmOptions['sync'];

            return {
              debug: appConfig.NODE_ENV === AppEnvironment.LOCAL,
              logger: (msg): void => loggerService.trace(`[OrmService] ${msg}`),
              entities: rootEntities,
              ...mikroOrmOptions,
            };
          },
        },
        {
          provide: OrmInjectionToken.ORM_SCHEMA_OPTIONS,
          inject: [ OrmInjectionToken.ORM_MODULE_OPTIONS ],
          useFactory: (ormModuleOptions: OrmModuleOptions): SchemaModuleOptions => ormModuleOptions.sync,
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
