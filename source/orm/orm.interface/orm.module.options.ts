import { OrmConfigOptions } from './orm.config.options';

export interface OrmModuleOptions {
  config: OrmConfigOptions | any;
  disableEntityScan?: boolean;
  entities?: any[];
}
