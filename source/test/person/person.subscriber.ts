import { Injectable, LoggerService } from '@bechara/nestjs-core';
import { EntityManager } from '@mikro-orm/core';

import { OrmSubscriber, OrmSubscriberParams } from '../../orm/orm.interface';
import { Person } from './person.entity';

@Injectable()
export class PersonSubscriber implements OrmSubscriber<Person> {

  public constructor(
    private readonly entityManager: EntityManager,
    private readonly loggerService: LoggerService,
  ) {
    entityManager.getEventManager().registerSubscriber(this);
  }

  /**
   * Before update hook example.
   * @param params
   */
  public beforeUpdate(params: OrmSubscriberParams<Person>): Promise<void> {
    const { changeSet } = params;
    this.loggerService.warning('beforeUpdate: changeSet', changeSet);
    return;
  }

}
