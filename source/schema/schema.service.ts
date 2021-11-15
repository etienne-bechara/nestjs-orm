import { Inject, Injectable, LoggerService, NotFoundException } from '@bechara/nestjs-core';
import { MikroORM } from '@mikro-orm/core';

import { SchemaInjectionToken, SchemaSyncStatus } from './schema.enum';
import { SchemaModuleOptions, SchemaSyncResult } from './schema.interface';

@Injectable()
export class SchemaService {

  public constructor(
    @Inject(SchemaInjectionToken.MODULE_OPTIONS)
    private readonly syncModuleOptions: SchemaModuleOptions = { },
    private readonly mikroOrm: MikroORM,
    private readonly loggerService: LoggerService,
  ) {
    const options = this.syncModuleOptions;

    if (options.auto) {
      void this.syncSchema(options);
    }
  }

  /**
   * Remove from schema queries that has been blacklisted.
   * @param queries
   * @param options
   */
  private removeBlacklistedQueries(queries: string, options: SchemaModuleOptions): string {
    options.blacklist ??= [ ];
    queries = queries.replace(/\n+/g, '\n');
    return queries.split('\n').filter((q) => !options.blacklist.includes(q)).join('\n');
  }

  /**
   * Sync database schema from an external trigger.
   */
  public syncSchemaFromController(): Promise<SchemaSyncResult> {
    const { controller } = this.syncModuleOptions;

    if (!controller) {
      throw new NotFoundException('Cannot GET /schema/sync');
    }

    return this.syncSchema();
  }

  /**
   * Automatically sync current database schema with
   * configured entities.
   * @param options
   */
  public async syncSchema(options: SchemaModuleOptions = { }): Promise<SchemaSyncResult> {
    this.loggerService.info('[OrmService] Starting database schema sync...');

    const generator = this.mikroOrm.getSchemaGenerator();
    let syncDump = await generator.getUpdateSchemaSQL(false, options.safe);
    syncDump = this.removeBlacklistedQueries(syncDump, options);

    if (syncDump.length === 0) {
      this.loggerService.notice('[OrmService] Database schema is up to date');
      return { status: SchemaSyncStatus.UP_TO_DATE };
    }

    let status = SchemaSyncStatus.MIGRATION_SUCCESSFUL;
    let syncQueries = await generator.getUpdateSchemaSQL(true, options.safe);
    syncQueries = this.removeBlacklistedQueries(syncQueries, options);

    try {
      await generator.execute(syncQueries);
      this.loggerService.notice('[OrmService] Database schema successfully updated');
    }
    catch (e) {
      status = SchemaSyncStatus.MIGRATION_FAILED;
      this.loggerService.error('[OrmService] Database schema update failed', e as Error, { syncQueries });
    }

    return {
      status,
      queries: syncQueries.split('\n'),
    };
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
