import { Controller, Get } from '@bechara/nestjs-core';

import { SchemaSyncResult } from './schema.interface';
import { SchemaService } from './schema.service';

@Controller('schema')
export class SchemaController {

  public constructor(
    private readonly schemaService: SchemaService,
  ) { }

  @Get('sync')
  public getSync(): Promise<SchemaSyncResult> {
    return this.schemaService.syncSchemaFromController();
  }

}
