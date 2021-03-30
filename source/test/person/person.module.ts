import { Module } from '@bechara/nestjs-core';

import { PersonController } from './person.controller';
import { PersonService } from './person.service';

@Module({
  controllers: [ PersonController ],
  providers: [ PersonService ],
  exports: [ PersonService ],
})
export class PersonModule { }
