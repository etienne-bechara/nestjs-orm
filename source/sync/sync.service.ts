import { Inject, Injectable, LoggerService } from '@bechara/nestjs-core';
import { MikroORM } from '@mikro-orm/core';

import { SyncInjectionToken } from './sync.enum';
import { SyncModuleOptions } from './sync.interface';

@Injectable()
export class SyncService {

  public constructor(
    @Inject(SyncInjectionToken.MODULE_OPTIONS)
    private readonly syncModuleOptions: SyncModuleOptions = { },
    private readonly mikroOrm: MikroORM,
    private readonly loggerService: LoggerService,
  ) {
    const options = this.syncModuleOptions;

    if (options.enable) {
      void this.syncSchema(options);
    }
  }

  /**
   * Remove from schema queries that has been blacklisted.
   * @param queries
   * @param options
   */
  private removeBlacklistedQueries(queries: string, options: SyncModuleOptions): string {
    options.blacklist ??= [ ];
    queries = queries.replace(/\n+/g, '\n');
    return queries.split('\n').filter((q) => !options.blacklist.includes(q)).join('\n');
  }

  /**
   * Automatically sync current database schema with
   * configured entities.
   * @param options
   */
  public async syncSchema(options: SyncModuleOptions): Promise<void> {
    this.loggerService.info('[OrmService] Starting database schema sync...');

    const generator = this.mikroOrm.getSchemaGenerator();
    let syncDump = await generator.getUpdateSchemaSQL(false, options.safe);
    syncDump = this.removeBlacklistedQueries(syncDump, options);

    if (syncDump.length === 0) {
      return this.loggerService.notice('[OrmService] Database schema is up to date');
    }

    let syncQueries = await generator.getUpdateSchemaSQL(true, options.safe);
    syncQueries = this.removeBlacklistedQueries(syncQueries, options);
    await generator.execute(syncQueries);

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
