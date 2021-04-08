export interface OrmServiceOptions<T> {
  uniqueKey?: string[];
  populate?: (keyof T)[] | string[];
  populateById?: (keyof T)[] | string[];
}
