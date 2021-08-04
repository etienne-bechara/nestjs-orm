import { Module } from '@bechara/nestjs-core';

import { ContactController } from './contact.controller';

@Module({
  controllers: [
    ContactController,
  ],
})
export class ContactModule { }
