# NestJS ORM Component

This package acts as a plugin for [NestJS Core Components](https://github.com/etienne-bechara/nestjs-core) and adds ORM capabilities including service functionalities and controllers.

Supports MongoDB, MySQL, MariaDB, PostgreSQL and SQLite.

## Installation

The following instructions considers you already have a project set up with [@bechara/nestjs-core](https://www.npmjs.com/package/@bechara/nestjs-core).

If not, please refer to documentation above before proceeding.


1\. Install the new necessary dependencies:

```
npm i @bechara/nestjs-orm
```

Followed by the corresponding driver of your database type:

```
npm i @mikro-orm/mongodb
npm i @mikro-orm/mysql
npm i @mikro-orm/mariadb
npm i @mikro-orm/postgresql
npm i @mikro-orm/sqlite
```


2\. Add these example variables to your `.env` (adjust accordingly):

```
ORM_TYPE='mysql'
ORM_HOST='localhost'
ORM_PORT=3306
ORM_USERNAME='root'
ORM_PASSWORD='1234'
ORM_DATABASE='test'
ORM_SYNC_SCHEMA=true
ORM_SYNC_SAFE=false
```

It is recommended that you have a local database in order to test connectivity.

3\. Import `OrmModule` and `OrmConfig` into you boot script and configure asynchronously:

```ts
import { AppModule } from '@bechara/nestjs-core';
import { OrmConfig } from '@bechara/nestjs-orm';
import { OrmModule } from '@bechara/nestjs-orm';

void AppModule.bootServer({
  configs: [ OrmConfig ],
  imports: [
    OrmModule.registerAsync({
      inject: [ OrmConfig ],
      useFactory: (ormConfig: OrmConfig) => ({
        type: ormConfig.ORM_TYPE,
        host: ormConfig.ORM_HOST,
        port: ormConfig.ORM_PORT,
        database: ormConfig.ORM_DATABASE,
        username: ormConfig.ORM_USERNAME,
        password: ormConfig.ORM_PASSWORD,
        schemaSync: ormConfig.ORM_SYNC_SCHEMA,
        safeSync: ormConfig.ORM_SYNC_SAFE,
      }),
    }),
  ],
  providers: [ OrmConfig ],
  exports: [ OrmConfig, OrmModule ],
});
```

If you wish to change how environment variables are injected you may provide your own configuration instead of using the built-in `OrmConfig`.

4\. Before booting the application, create at least one entity inside your project source. Refer to **Usage** section below for further details.


## Usage

We may simplify the process of adding data storage functionality as:
- Create the entity definition (table, columns and relationships)
- Create its service (repository abstraction extending provided one)
- Create its controller (extending provided one)

### Creating an Entity Definition

Please refer to the official [Defining Entities](https://mikro-orm.io/docs/defining-entities) documentation from MikroORM.

### Creating an Entity Service

In order to create a new entity service, extend the provided abstract service from this package and inject an repository instance.

Then, you should call its super method passing this instance as well as an optional object with further customizations.

Example:

```ts
import { OrmService } from '@bechara/nestjs-orm';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@bechara/nestjs-core';

// This entity is whatever you defined in the previous step 
import { UserEntity } from './user.entity';

@Injectable()
export class UserService extends OrmService<UserEntity> {

  public constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: EntityRepository<UserEntity>,
  ) {
    super(userRepository, {
      uniqueKey: [ 'name' ], // [Optional] Combination of fields to enable entity update instead of requiring ID
      populate: [ 'employers' ], // [Optional] Nested entities to automatic populate
    });
  }

}
```

At this point, you may inject you `UserService` in any order provider and have its methods available to you:
```ts
readById(id: string, options: OrmReadOptions<Entity> = { }): Entity

readUnique(params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { }): Entity

readAndCount(params: OrmReadParams<Entity>, options: OrmReadOptions<Entity> = { }): OrmPaginatedResponse<Entity>

updateById(id: string, data: EntityData<Entity>): Entity

resert(data: EntityData<Entity>, uniqueKey?: string[]): Entity 

upsert(data: EntityData<Entity>, uniqueKey?: string[]): Entity
```

### Creating an Entity Controller

Finally, you may automatic boot routes to manipulate your entities by extending the base controller and injecting the recently created service.

Example:

```ts
import { OrmController, OrmControllerMethod } from '@bechara/nestjs-orm';
import { Controller } from '@bechara/nestjs-core';

// These DTOs are validations customized with class-validator and class-transformer
import { UserCreateDto, UserReadDto, UserUpdateDto } from './user.dto';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController extends OrmController<UserEntity> {

  public constructor(
    private readonly userService: UserService,
  ) {
    super(userService, {
      routes: [
        { method: OrmControllerMethod.GET, queryDto: UserReadDto },
        { method: OrmControllerMethod.GET_BY_ID, queryDto: UserReadDto },
        { method: OrmControllerMethod.POST, bodyDto: UserCreateDto },
        { method: OrmControllerMethod.PUT, bodyDto: UserCreateDto },
        { method: OrmControllerMethod.PUT_BY_ID, bodyDto: UserUpdateDto },
        { method: OrmControllerMethod.DELETE_BY_ID },
      ],
    });
  }

}
```


## Full Examples

Refer to `test` folder of this project for a full working example including:
- Entities with several different column types
- Entity relationships
- Service repository extension
- Controller extension
