⚠️ **Disclaimer**: This project is opinionated and intended for personal use.

---

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

2\. Add these example variables to your `.env` (adjust accordingly):

```
ORM_TYPE='mysql'
ORM_HOST='localhost'
ORM_PORT=3306
ORM_USERNAME='root'
ORM_PASSWORD='1234'
ORM_DATABASE='test'
```

It is recommended that you have a local database in order to test connectivity.

3\. Import `OrmModule` and `OrmConfig` into you boot script and configure asynchronously:

```ts
import { AppEnvironment, AppModule } from '@bechara/nestjs-core';
import { OrmConfig. OrmModule } from '@bechara/nestjs-orm';

void AppModule.bootServer({
  configs: [ OrmConfig ],
  imports: [
    OrmModule.registerAsync({
      inject: [ OrmConfig ],
      useFactory: (ormConfig: OrmConfig) => ({
        type: ormConfig.ORM_TYPE,
        host: ormConfig.ORM_HOST,
        port: ormConfig.ORM_PORT,
        dbName: ormConfig.ORM_DATABASE,
        user: ormConfig.ORM_USERNAME,
        password: ormConfig.ORM_PASSWORD,
        pool: { min: 1, max: 25 },
        sync: {
          enable: true,
          safe: ormConfig.NODE_ENV === AppEnvironment.PRODUCTION,
        },
        driverOptions: ormConfig.ORM_SERVER_CA
          ? {
            connection: {
              ssl: {
                ca: Buffer.from(ormConfig.ORM_SERVER_CA, 'base64'),
                cert: Buffer.from(ormConfig.ORM_CLIENT_CERTIFICATE, 'base64'),
                key: Buffer.from(ormConfig.ORM_CLIENT_KEY, 'base64'),
              },
            },
          }
          : undefined,
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
import { OrmService, EntityRepository, InjectRepository } from '@bechara/nestjs-orm';
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
      defaultUniqueKey: [ 'name' ], // [Optional] Combination of fields to enable entity upsert
      defaultPopulate: [ 'employers' ], // [Optional] Nested entities to automatic load when no 'populate' option is provided
    });
  }

}
```

At this point, you may inject you `UserService` in any order provider and have its methods available to you:

```ts
// Read entities
read(): Promise<Entity[]>;
count(): Promise<number>;
readById(): Promise<Entity>;
readByIdOrFail(): Promise<Entity>;
readUnique(): Promise<Entity>;
readUniqueOrFail(): Promise<Entity>;
readAndCount(): Promise<OrmPaginatedResponse<Entity>>;
reload(): Promise<Entity[]>;

// Create entities
create(): Promise<Entity[]>;
createOne(): Promise<Entity>;
readOrCreate(): Promise<Entity[]>;
readOrCreateOne(): Promise<Entity>;

// Update entities
update(): Promise<Entity[]>;
updateOne(): Promise<Entity>;
updateById(): Promise<Entity>;
upsert(): Promise<Entity[]>;
upsertOne(): Promise<Entity>;

// Remove entities
remove(): Promise<Entity[]>;
removeOne(): Promise<Entity>;
removeById(id: string): Promise<Entity>;
```

You may also extending the functionality of these built-in methods with these provided hooks:

```ts
beforeRead(): Promise<OrmReadParams<Entity>>;
afterRead(): Promise<Entity>;

beforeCreate(): Promise<EntityData<Entity>>;
afterCreate(): Promise<Entity>;

beforeUpdate(): Promise<OrmUpdateParams<Entity>>;
afterUpdate(): Promise<Entity>;

beforeRemove(): Promise<Entity>;
afterRemove(): Promise<Entity>;
```

### Creating an Entity Controller

Finally, expose a controller injecting your service as dependency to allow manipulation through HTTP requests.

If you are looking for CRUD functionality you may copy exactly as the template below.

Example:

```ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@bechara/nestjs-core';
import { OrmController, OrmPagination } from '@bechara/nestjs-orm';

// These DTOs are validations customized with class-validator and class-transformer
import { UserCreateDto, UserReadDto, UserUpdateDto } from './user.dto';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController extends OrmController<UserEntity> {

  public constructor(
    private readonly userService: UserService,
  ) {
    super(userService);
  }

  @Get()
  public async get(@Query() query: UserReadDto): Promise<OrmPagination<UserEntity>> {
    // getReadArguments() is a built-in method that extracts pagination
    // properties like sort, order, limit and offset
    const { params, options } = this.getReadArguments(query);
    return this.entityService.readAndCount(params, options);
  }

  @Get(':id')
  public async getById(@Param('id') id: string): Promise<UserEntity> {
    return this.entityService.readByIdOrFail(id);
  }

  @Post()
  public async post(@Body() body: UserCreateDto): Promise<UserEntity> {
    return this.entityService.createOne(body);
  }

  @Put()
  public async put(@Body() body: UserCreateDto): Promise<UserEntity> {
    return this.entityService.upsertOne(body);
  }

  @Put(':id')
  public async putById(@Param('id') id: string, @Body() body: UserCreateDto): Promise<UserEntity> {
    return this.entityService.updateById(id, body);
  }

  @Patch(':id')
  public async patchById(@Param('id') id: string, @Body() body: UserUpdateDto): Promise<UserEntity> {
    return this.entityService.updateById(id, body);
  }

  @Delete(':id')
  public async deleteById(@Param('id') id: string): Promise<UserEntity> {
    return this.entityService.removeById(id);
  }

}
```


## Full Examples

Refer to `test` folder of this project for a full working example including:
- Entities with several different column types
- Entity relationships including ManyToOne and ManyToMany
- Service repository extension
- Controller extension with CRUD functionality
