import { OrmControllerMethod } from '../orm.enum';

export interface OrmRequestValidation {
  method: OrmControllerMethod;
  query?: Record<string, any>;
  body?: any;
}
