export interface OrmUpsertOptions {
  uniqueKey?: string[];
  allowUpdate?: boolean;
  disallowRetry?: boolean;
}
