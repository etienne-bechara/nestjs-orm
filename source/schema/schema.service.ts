import { Inject, Injectable, LoggerService } from '@bechara/nestjs-core';
import { MikroORM } from '@mikro-orm/core';

import { SchemaInjectionToken } from './schema.enum';
import { SchemaModuleOptions } from './schema.interface';

@Injectable()
export class SchemaService {

  public constructor(
    @Inject(SchemaInjectionToken.MODULE_OPTIONS)
    private readonly schemaModuleOptions: SchemaModuleOptions,
    private readonly mikroOrm: MikroORM,
    private readonly loggerService: LoggerService,
  ) {
    const options = this.schemaModuleOptions;

    if (options.schemaSync) {
      void this.syncSchema(options.safeSync);
    }
  }

  /**
   * Automatically sync current database schema with
   * configured entities.
   * @param safe
   */
  public async syncSchema(safe?: boolean): Promise<void> {
    this.loggerService.info('[OrmService] Starting database schema sync...');

    const generator = this.mikroOrm.getSchemaGenerator();
    const updateDump = await generator.getUpdateSchemaSQL(false, safe);

    if (updateDump.length === 0) {
      return this.loggerService.notice('[OrmService] Database schema is up to date');
    }

    await generator.updateSchema(true, safe);
    this.loggerService.notice('[OrmService] Database schema successfully updated');
  }

  /**
   * Erase current database schema and recreate it.
   */
  public async resetSchema(): Promise<void> {
    this.loggerService.info('[OrmService] Starting database schema reset...');

    const generator = this.mikroOrm.getSchemaGenerator();
    await generator.dropSchema();
    await generator.createSchema();

    this.loggerService.notice('[OrmService] Database schema successfully reset');
  }

}
