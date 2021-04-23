import { BadRequestException, Body, Delete, Get, NotFoundException,
  Param, Patch, Post, Put, Query, UseInterceptors } from '@bechara/nestjs-core';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { unflatten } from 'flat';

import { OrmPaginationDto } from './orm.dto';
import { OrmEntitySerializer } from './orm.interceptor';
import { OrmControllerOptions, OrmPaginatedResponse, OrmRequestValidation, OrmValidationData } from './orm.interface';
import { OrmService } from './orm.service';

/**
 * Implements generic CRUD controller connected to an entity service.
 */
@UseInterceptors(OrmEntitySerializer)
export abstract class OrmController<Entity> {

  public constructor(
    public readonly entityService: OrmService<Entity>,
    protected readonly controllerOptions: OrmControllerOptions = { },
  ) { }

  /**
   * Validates predefined request based on configuration options.
   * @param params
   */
  private async validateRequest(params: OrmRequestValidation): Promise<OrmValidationData> {
    const options = this.controllerOptions;
    options.methods ??= [ 'GET', 'GET:id', 'POST', 'PUT', 'PUT:id', 'PATCH:id', 'DELETE:id' ];
    options.dto ??= { };

    if (!options.methods.includes(params.method)) {
      throw new NotFoundException(`Cannot ${params.method.split('_BY_')[0]} to path`);
    }

    if (params.create && options.dto.create) {
      await this.plainToDto(params.create, options.dto.create);
    }

    if (params.update && options.dto.update) {
      await this.plainToDto(params.update, options.dto.update);
    }

    let queryData, queryOptions;

    if (params.read && options.dto.read) {
      const paginationProperties = [ 'sort', 'order', 'limit', 'offset' ];
      const parsedQuery = this.parseFilterOperators(params.read);

      const query = await this.plainToDto(parsedQuery.stripped, options.dto.read);
      queryData = parsedQuery.unflatted;
      queryOptions = { ...query };

      for (const key of paginationProperties) {
        delete queryData[key];
      }

      for (const key in queryOptions) {
        if (!paginationProperties.includes(key)) {
          delete queryOptions[key];
        }
      }
    }

    return { queryData, queryOptions };
  }

  /**
   * Transforms an object into desired type, returns the typed
   * object or throws an exception with array of constraints.
   * @param object
   * @param type
   */
  private async plainToDto(object: any, type: any): Promise<any> {
    const typedObject = plainToClass(type, object);
    const validationErrors: string[] = [ ];

    const failedConstraints = await validate(typedObject, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    for (const failure of failedConstraints) {
      if (failure.children) {
        failure.children = failure.children.map((c) => {
          return { parent: failure.property, ...c };
        });
        failedConstraints.push(...failure.children);
      }

      if (failure.constraints) {
        let partials = Object.values(failure.constraints);

        if (failure['parent']) {
          partials = partials.map((p) => `${failure['parent']}: ${p}`);
        }

        validationErrors.push(...partials);
      }
    }

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors);
    }

    return typedObject;
  }

  /**
   * Search provided object for ORM operators ($gt, $gte, $lt, $lte, $like, etc..)
   * Returns two versions of the same object:
   * • Stripped: version without operators, used for validation with DTOs
   * • Unflatted: version with operators nested inside the property, used at ORM.
   * @param object
   */
  private parseFilterOperators(object: any = { }): { stripped: any; unflatted: any } {
    const allowedOperators = new Set([ 'eq', 'gt', 'gte', 'lt', 'lte', 'ne', 'like', 're' ]);

    const source = { ...object };
    const stripped = { ...object };
    const unflatted = { ...object };

    for (const key in source) {
      const operatorValidation = key.split('$');
      if (operatorValidation.length <= 1) continue;

      if (operatorValidation.length > 2) {
        throw new BadRequestException(`${key} has too many filter operators`);
      }

      if (!allowedOperators.has(operatorValidation[1])) {
        throw new BadRequestException(`${operatorValidation[1]} filter operator is not recognized`);
      }

      stripped[key.split('$')[0].replace(/\.+$/, '')] = stripped[key];
      delete stripped[key];

      const normalizedKey = key.replace(/\.+\$/, '$').replace('$', '.$');
      unflatted[normalizedKey] = unflatted[key];
      if (key !== normalizedKey) delete unflatted[key];
    }

    return {
      stripped: unflatten(stripped),
      unflatted: unflatten(unflatted),
    };
  }

  /**
   * Read all entities that matches desired criteria and
   * returns within an object with pagination details.
   * @param query
   */
  @Get()
  public async get(@Query() query: OrmPaginationDto & Entity): Promise<OrmPaginatedResponse<Entity>> {
    const validationData = await this.validateRequest({ method: 'GET', read: query });
    return this.entityService.readAndCount(validationData.queryData, validationData.queryOptions);
  }

  /**
   * Read a single entity by its id.
   * @param id
   */
  @Get(':id')
  public async getById(@Param('id') id: string): Promise<Entity> {
    await this.validateRequest({ method: 'GET:id' });
    return this.entityService.readByIdOrFail(id);
  }

  /**
   * Creates a single entity validating its data
   * across provided create DTO.
   * @param body
   */
  @Post()
  public async post(@Body() body: Entity): Promise<Entity> {
    await this.validateRequest({ method: 'POST', create: body });
    return this.entityService.create(body) as Promise<Entity>;
  }

  /**
   * Creates or updates a single entity validating its data
   * across provided create DTO.
   * @param body
   */
  @Put()
  public async put(@Body() body: Entity): Promise<Entity> {
    await this.validateRequest({ method: 'PUT', create: body });
    return this.entityService.upsert(body) as Promise<Entity>;
  }

  /**
   * Replaces a single entity validating its data
   * across provided create DTO.
   * @param id
   * @param body
   */
  @Put(':id')
  public async putById(@Param('id') id: string, @Body() body: Entity): Promise<Entity> {
    await this.validateRequest({ method: 'PUT:id', create: body });
    return this.entityService.updateById(id, body);
  }

  /**
   * Updates a single entity validating its data
   * across provided update DTO.
   * @param id
   * @param body
   */
  @Patch(':id')
  public async patchById(@Param('id') id: string, @Body() body: Entity): Promise<Entity> {
    await this.validateRequest({ method: 'PATCH:id', update: body });
    return this.entityService.updateById(id, body);
  }

  /**
   * Deletes a single entity by its id.
   * @param id
   */
  @Delete(':id')
  public async deleteById(@Param('id') id: string): Promise<Entity> {
    await this.validateRequest({ method: 'DELETE:id' });
    return this.entityService.removeById(id);
  }

}

