import { OrmControllerMethod } from '../orm.enum';

export interface OrmControllerOptions {
  dto: OrmControllerDto;
  methods: OrmControllerMethod[];
}

export interface OrmControllerDto {
  read: any;
  create: any;
  update: any;
}
