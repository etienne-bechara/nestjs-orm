import { DynamicModule, LoggerModule, Module } from '@bechara/nestjs-core';
import { v4 } from 'uuid';

import { SyncInjectionToken } from './sync.enum';
import { SyncAsyncModuleOptions, SyncModuleOptions } from './sync.interface';
import { SyncService } from './sync.service';

@Module({
  imports: [ LoggerModule ],
  providers: [
    SyncService,
    {
      provide: SyncInjectionToken.MODULE_OPTIONS,
      useValue: { },
    },
  ],
  exports: [
    SyncService,
  ],
})
export class SyncModule {

  /**
   * Registers underlying service with provided options.
   * @param options
   */
  public static register(options: SyncModuleOptions): DynamicModule {
    return {
      module: SyncModule,
      providers: [
        {
          provide: SyncInjectionToken.MODULE_ID,
          useValue: v4(),
        },
        {
          provide: SyncInjectionToken.MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  /**
   * Register underlying service with provided options asynchronously.
   * @param options
   */
  public static registerAsync(options: SyncAsyncModuleOptions = { }): DynamicModule {
    return {
      module: SyncModule,
      imports: options.imports,
      providers: [
        {
          provide: SyncInjectionToken.MODULE_ID,
          useValue: v4(),
        },
        {
          provide: SyncInjectionToken.MODULE_OPTIONS,
          inject: options.inject,
          useFactory: options.useFactory,
        },
      ],
    };
  }

}
