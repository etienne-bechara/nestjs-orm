import { SchemaSyncStatus } from '../schema.enum';

export interface SchemaSyncResult {
  status: SchemaSyncStatus;
  queries?: string[];
}
