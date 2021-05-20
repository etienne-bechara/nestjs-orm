import { SyncSchemaStatus } from '../sync.enum';

export interface SyncSchemaResult {
  status: SyncSchemaStatus;
  queries?: string[];
}
