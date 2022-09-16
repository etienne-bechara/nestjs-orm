import { Body, Controller, Post } from '@bechara/nestjs-core';

import { RelationCreateDto } from './relation.dto';
import { RelationRepository } from './relation.repository';

@Controller('relation')
export class RelationController {

  public constructor(
    private readonly relationRepository: RelationRepository,
  ) { }

  @Post()
  public async post(@Body() body: RelationCreateDto): Promise<void> {
    await this.relationRepository.createOne(body);
  }

}
