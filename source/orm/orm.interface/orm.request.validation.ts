import { OrmControllerMethod } from '../orm.enum';

export interface OrmRequestValidation {
  method: OrmControllerMethod;
  read?: any;
  create?: any;
  update?: any;
}
