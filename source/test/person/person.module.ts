import { Module } from '@bechara/nestjs-core';

import { PersonController } from './person.controller';
import { PersonSubscriber } from './person.subscriber';

@Module({
  controllers: [
    PersonController,
  ],
  providers: [
    PersonSubscriber,
  ],
})
export class PersonModule { }
