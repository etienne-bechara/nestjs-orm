import { AppModule } from '@bechara/nestjs-core';

import { compileTestApp } from '../test/main';

/**
 * Boot example application based on test file.
 */
async function boot(): Promise<void> {
  const app = await compileTestApp();
  void AppModule.boot({ app });
}

void boot();
