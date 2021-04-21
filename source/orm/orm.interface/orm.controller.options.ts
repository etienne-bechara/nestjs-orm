import { OrmControllerMethod } from '../orm.enum';

export interface OrmControllerOptions {
  methods?: OrmControllerMethod[];
  dto?: OrmControllerDto;
}

export interface OrmControllerDto {
  read?: any;
  create?: any;
  update?: any;
}
