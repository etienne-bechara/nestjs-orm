import { Module } from '@bechara/nestjs-core';

import { StartupService } from './startup.service';

@Module({
  providers: [
    StartupService,
  ],
  exports: [
    StartupService,
  ],
})
export class StartupModule { }
