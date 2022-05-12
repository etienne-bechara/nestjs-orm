import { AppModule, INestApplication } from '@bechara/nestjs-core';

import { OrmModule } from '../source/orm/orm.module';
import { Address } from './address/address.entity';
import { Order } from './order/order.entity';
import { Product } from './product/product.entity';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';

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
        useFactory: () => ({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          dbName: 'nestjs-orm',
          user: 'root',
          password: 'password',
        }),
        entities: [ Address, Order, Product, User ],
      }),
    ],
    exports: [
      OrmModule,
    ],
  });
}
