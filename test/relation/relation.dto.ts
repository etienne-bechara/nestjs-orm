import { IsUUID } from '@bechara/nestjs-core';

export class RelationCreateDto {

  @IsUUID()
  public parent: string;

  @IsUUID()
  public child: string;

}
