import { Module } from '@bechara/nestjs-core';

import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  controllers: [ ContactController ],
  providers: [ ContactService ],
  exports: [ ContactService ],
})
export class ContactModule { }
