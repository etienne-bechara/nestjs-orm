export interface OrmExceptionHandlerParams {
  caller: (retries: number) => any;
  retries: number;
  error: Error;
}
