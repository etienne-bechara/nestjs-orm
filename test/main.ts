import { AppModule, INestApplication } from '@bechara/nestjs-core';

import { OrmModuleOptions } from '../source/orm/orm.interface';
import { OrmModule } from '../source/orm/orm.module';
import { Address } from './address/address.entity';
import { Metadata } from './metadata/metadata.entity';
import { Order } from './order/order.entity';
import { Product } from './product/product.entity';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';

const ormType = process.env.ORM_TYPE;

const options: OrmModuleOptions = {
  type: ormType as any,
  host: 'localhost',
  dbName: 'nestjs-orm',
  password: 'password',
};

switch (ormType) {
  case 'mysql':
    options.port = 3306;
    options.user = 'root';
    break;

  case 'postgresql':
    options.port = 5432;
    options.user = 'postgres';
    break;
}

/**
 * Build an application with database connection for ORM tests.
 */
export async function compileTestApp(): Promise<INestApplication> {
  return AppModule.compile({
    disableScan: true,
    disableLogs: true,
    imports: [
      UserModule,
      OrmModule.registerAsync({
        disableEntityScan: true,
        useFactory: () => options,
        entities: [ Address, Metadata, Order, Product, User ],
      }),
    ],
    exports: [
      OrmModule,
    ],
  });
}
