import { Module } from '@bechara/nestjs-core';

import { UserController } from './user.controller';
import { UserSubscriber } from './user.subscriber';

@Module({
  controllers: [
    UserController,
  ],
  providers: [
    UserSubscriber,
  ],
})
export class UserModule { }
