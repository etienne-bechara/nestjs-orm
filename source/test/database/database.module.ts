import { Module } from '@nestjs/common';

import { OrmModule } from '../../orm/orm.module';
import { DatabaseConfig } from './database.config';

@Module({
  imports: [ OrmModule.register({ config: DatabaseConfig }) ],
  providers: [ DatabaseConfig ],
  exports: [ DatabaseConfig ],
})
export class DatabaseModule { }
