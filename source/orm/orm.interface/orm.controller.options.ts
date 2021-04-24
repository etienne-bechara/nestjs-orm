import { Populate } from '@mikro-orm/core';

import { OrmControllerMethod } from '../orm.enum';

export interface OrmControllerOptions<T> {
  methods?: OrmControllerMethod[];
  dto?: OrmControllerDto;
  populate?: Populate<T>;
  populateById?: Populate<T>;
}

export interface OrmControllerDto {
  read?: any;
  create?: any;
  update?: any;
}
