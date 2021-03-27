import { AppEnvironment, LoggerService, UtilModule } from '@bechara/nestjs-core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DynamicModule, Global, Module } from '@nestjs/common';

import { SchemaModule } from '../schema/schema.module';
import { OrmIdEntity, OrmTimestampEntity, OrmUuidEntity } from './orm.entity';
import { OrmModuleOptions } from './orm.interface';
import { OrmConfigOptions } from './orm.interface/orm.config.options';

@Global()
@Module({ })
export class OrmModule {

  /**
   * Configure the underlying ORM component with the following additions:
   * • Adds built-in logger service for debugging (local only).
   * @param options
   */
  public static register(options: OrmModuleOptions): DynamicModule {
    const entities = options.disableEntityScan
      ? options.entities || [ ]
      : UtilModule.globRequire([ 's*rc*/**/*.entity.ts', '!**/orm*entity.ts' ]);

    const rootEntities = [ OrmIdEntity, OrmUuidEntity, OrmTimestampEntity, ...entities ];

    return {
      module: OrmModule,
      imports: [
        MikroOrmModule.forRootAsync({
          inject: [ options.config, LoggerService ],
          useFactory: (ormConfig: OrmConfigOptions, loggerService: LoggerService) => ({
            type: ormConfig.ORM_TYPE,
            host: ormConfig.ORM_HOST,
            port: ormConfig.ORM_PORT,
            dbName: ormConfig.ORM_DATABASE,
            user: ormConfig.ORM_USERNAME,
            password: ormConfig.ORM_PASSWORD,
            debug: ormConfig.NODE_ENV === AppEnvironment.LOCAL,
            logger: (msg): void => loggerService.debug(`[OrmService] ${msg}`),
            entities: rootEntities,
            ...ormConfig.ORM_EXTRAS,
          }),
        }),

        SchemaModule.registerAsync({
          inject: [ options.config, LoggerService ],
          useFactory: (ormConfig: OrmConfigOptions) => ({
            schemaSync: ormConfig.ORM_SYNC_SCHEMA,
            safeSync: ormConfig.ORM_SYNC_SAFE,
          }),
        }),

        MikroOrmModule.forFeature({ entities }),
      ],
      exports: [
        MikroOrmModule.forFeature({ entities }),
      ],
    };
  }

}
