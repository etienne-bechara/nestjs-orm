import { OrmControllerMethod } from '../orm.enum';

export interface OrmControllerOptions {
  routes: OrmControllerRoute[];
}

export interface OrmControllerRoute {
  method: OrmControllerMethod;
  queryDto?: any;
  bodyDto?: any;
}
