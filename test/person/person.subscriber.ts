import { Injectable, LoggerService } from '@bechara/nestjs-core';
import { EntityManager } from '@mikro-orm/core';

import { OrmSubscriberParams } from '../../source/orm/orm.interface';
import { OrmSubscriber } from '../../source/orm/orm.subscriber';
import { Person } from './person.entity';

@Injectable()
export class PersonSubscriber extends OrmSubscriber<Person> {

  public constructor(
    protected readonly entityManager: EntityManager,
    private readonly loggerService: LoggerService,
  ) {
    super(entityManager, {
      entities: Person,
    });
  }

  /**
   * Before create hook example.
   * @param params
   */
  public beforeCreate(params: OrmSubscriberParams<Person>): Promise<void> {
    const { entity } = params;
    this.loggerService.warning('Before create entity:', entity);
    return;
  }

  /**
   * After create hook example.
   * @param params
   */
  public afterCreate(params: OrmSubscriberParams<Person>): Promise<void> {
    const { entity } = params;
    this.loggerService.warning('After create entity:', entity);
    return;
  }

  /**
   * Before update hook example.
   * @param params
   */
  public beforeUpdate(params: OrmSubscriberParams<Person>): Promise<void> {
    const changeset = this.getChangeset(params);
    this.loggerService.warning('Before update changeset:', changeset);
    return;
  }

  /**
   * After update hook example.
   * @param params
   */
  public afterUpdate(params: OrmSubscriberParams<Person>): Promise<void> {
    const changeset = this.getChangeset(params);
    this.loggerService.warning('After update changeset:', changeset);
    return;
  }

}
