import { Module } from '@bechara/nestjs-core';

import { RelationController } from './relation.controller';

@Module({
  controllers: [
    RelationController,
  ],
})
export class RelationModule { }
