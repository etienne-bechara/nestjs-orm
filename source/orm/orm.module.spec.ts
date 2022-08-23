import { ContextStorage, HttpStatus } from '@bechara/nestjs-core';
import { MikroORM } from '@mikro-orm/core';

import { AddressState } from '../../test/address/address.enum';
import { AddressRepository } from '../../test/address/address.repository';
import { compileTestApp } from '../../test/main';
import { OrderRepository } from '../../test/order/order.repository';
import { ProductRepository } from '../../test/product/product.repository';
import { UserRepository } from '../../test/user/user.repository';
import { SchemaService } from '../schema/schema.service';
import { OrmQueryOrder, OrmStoreKey } from './orm.enum';

ContextStorage.enterWith(new Map());

describe('OrmModule', () => {
  let schemaService: SchemaService;
  let addressRepository: AddressRepository;
  let orderRepository: OrderRepository;
  let productRepository: ProductRepository;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const app = await compileTestApp();

    const mikroOrm = app.get(MikroORM);
    const entityManager = mikroOrm.em.fork({ clear: true, useContext: true });
    ContextStorage.getStore().set(OrmStoreKey.ENTITY_MANAGER, entityManager);

    schemaService = app.get(SchemaService);
    addressRepository = app.get(AddressRepository);
    orderRepository = app.get(OrderRepository);
    productRepository = app.get(ProductRepository);
    userRepository = app.get(UserRepository);
  });

  describe('SchemaService', () => {
    it('should reset database schema successfully', async () => {
      await schemaService.resetSchema();
      expect(true).toBeTruthy();
    });

    it('should create database schema successfully', async () => {
      await schemaService.syncSchema();
      expect(true).toBeTruthy();
    });
  });

  describe('OrmBaseRepository', () => {
    it('should rollback an asynchronously committed operation', async () => {
      userRepository.createOneAsync({
        name: 'John Doe',
        age: 20,
      });

      userRepository.rollback();
      await userRepository.commit();

      const userCount = await userRepository.countBy({ });
      expect(userCount).toBe(0);
    });
  });

  describe('OrmSubscriber', () => {
    it('should apply beforeCreate hook', async () => {
      await userRepository.createFrom({
        name: 'Julia Doe Smith',
        age: 10,
      });

      const [ julia ] = await userRepository.readBy({ name: 'Julia Smith' });
      expect(julia.name).toBe('Julia Smith');
    });
  });

  describe('OrmCreateRepository', () => {
    it('should build an entity and persist only after committing', async () => {
      const user = userRepository.buildOne({
        name: 'John Doe',
        age: 20,
      });

      await userRepository.commit();

      const softCommitCount = await userRepository.countBy({ name: 'John Doe' });
      await userRepository.commit(user);

      const [ john ] = await userRepository.readBy({ name: 'John Doe' });

      expect(softCommitCount).toBe(0);
      expect(john.name).toBe('John Doe');
      expect(john.age).toBe(20);
    });

    it('should disallow creating entity without mandatory property', async () => {
      let error: any;

      try {
        await userRepository.createOne({ name: 'Jane Doe' });
      }
      catch (e) {
        error = e;
      }

      expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should disallow creating entity with duplicate unique key', async () => {
      let error: any;

      try {
        await userRepository.createOne({ name: 'John Doe', age: 20 });
      }
      catch (e) {
        error = e;
      }

      expect(error.status).toBe(HttpStatus.CONFLICT);
    });

    it('should disallow creating entity that reference invalid foreign key', async () => {
      let error: any;

      try {
        await orderRepository.createOne({ user: 'John' });
      }
      catch (e) {
        error = e;
      }

      expect(error.status).toBe(HttpStatus.CONFLICT);
    });

    it('should create an one-to-one relation to existing entity', async () => {
      const [ john ] = await userRepository.readBy({ name: 'John Doe' });

      await addressRepository.createOne({
        user: john,
        zip: '00000000',
        state: AddressState.ES,
      });

      const addresses = await addressRepository.readBy({ user: john });
      expect(addresses[0].zip).toBe('00000000');
      expect(addresses[0].state).toBe(AddressState.ES);
    });

    it('should create entities with nested one-to-one relations', async () => {
      await userRepository.createFrom([
        {
          name: 'Jane Doe',
          age: 30,
          address: { zip: '11111111', state: AddressState.SP },
        },
        {
          name: 'Richard Smith',
          age: 40,
          address: { zip: '22222222', state: AddressState.RJ },
        },
      ]);

      const populate: any = [ 'address' ];
      const [ jane ] = await userRepository.readBy({ name: 'Jane Doe' }, { populate });
      const [ richard ] = await userRepository.readBy({ name: 'Richard Smith' }, { populate });

      expect(jane.age).toBe(30);
      expect(jane.address.zip).toBe('11111111');

      expect(richard.age).toBe(40);
      expect(richard.address.zip).toBe('22222222');
    });
  });

  describe('OrmReadRepository', () => {
    it('should read entities respecting order and sort', async () => {
      const { order, sort, records } = await userRepository.readAndCountBy({ }, {
        order: OrmQueryOrder.DESC,
        sort: 'name',
      });

      expect(order).toBe(OrmQueryOrder.DESC);
      expect(sort).toBe('name');
      expect(records[0].name).toBe('Richard Smith');
      expect(records[3].name).toBe('Jane Doe');
    });

    it('should read entities respecting limit', async () => {
      const { count, limit, records } = await userRepository.readAndCountBy({ }, { limit: 1 });

      expect(count).toBe(4);
      expect(limit).toBe(1);
      expect(records.length).toBe(1);
    });

    it('should read entities respecting order, sort, limit and offset', async () => {
      const { order, sort, records, count, limit, offset } = await userRepository.readAndCountBy({ }, {
        order: OrmQueryOrder.DESC,
        sort: 'name',
        limit: 1,
        offset: 2,
      });

      expect(count).toBe(4);
      expect(order).toBe(OrmQueryOrder.DESC);
      expect(sort).toBe('name');
      expect(limit).toBe(1);
      expect(offset).toBe(2);
      expect(records.length).toBe(1);
      expect(records[0].name).toBe('John Doe');
    });
  });

  describe('OrmUpdateRepository', () => {
    it('should update an existing entity', async () => {
      await productRepository.createOne({ title: 'Apple', price: 1.23 });
      const [ preApple ] = await productRepository.readBy({ title: 'Apple' });
      const preUpdateCost = preApple.price;

      await productRepository.update(preApple, { price: 2.34 });
      const [ postApple ] = await productRepository.readBy({ title: 'Apple' });
      const postUpdateCost = postApple.price;

      expect(preUpdateCost).toBe(1.23);
      expect(postUpdateCost).toBe(2.34);
    });

    it('should upsert entities accordingly', async () => {
      await productRepository.upsert([
        { title: 'Apple', price: 3.45 },
        { title: 'Banana', price: 4.56 },
        { title: 'Mango', price: 5.67 },
      ], {
        uniqueKey: [ 'title' ],
      });

      const [ apple ] = await productRepository.readBy({ title: 'Apple' });
      const [ banana ] = await productRepository.readBy({ title: 'Banana' });
      const [ mango ] = await productRepository.readBy({ title: 'Mango' });

      expect(apple.price).toBe(3.45);
      expect(banana.price).toBe(4.56);
      expect(mango.price).toBe(5.67);
    });

    it('should upsert entities with many-to-many relationships accordingly', async () => {
      const [ john ] = await userRepository.readBy({ name: 'John Doe' });
      const [ jane ] = await userRepository.readBy({ name: 'Jane Doe' });
      const [ apple ] = await productRepository.readBy({ title: 'Apple' });
      const [ banana ] = await productRepository.readBy({ title: 'Banana' });
      const [ mango ] = await productRepository.readBy({ title: 'Mango' });

      await orderRepository.createFrom([
        { id: 'A', user: john, products: [ apple ] },
        { id: 'B', user: john, products: [ apple ] },
      ]);

      await orderRepository.upsert([
        { id: 'A', products: [ banana ] },
        { id: 'B', user: john, products: [ banana, mango ] },
        { id: 'C', user: jane, products: [ apple, banana, mango ] },
      ], {
        uniqueKey: [ 'id' ],
      });

      const populate: any = [ 'user', 'products' ];
      const orderA = await orderRepository.readByIdOrFail('A', { populate });
      const orderB = await orderRepository.readByIdOrFail('B', { populate });
      const orderC = await orderRepository.readByIdOrFail('C', { populate });

      expect(orderA.user.name).toBe('John Doe');
      expect(orderA.products.toArray().length).toBe(1);
      expect(orderA.products.toArray().map((p) => p.title).sort()).toStrictEqual([ 'Banana' ]);

      expect(orderB.user.name).toBe('John Doe');
      expect(orderB.products.toArray().length).toBe(2);
      expect(orderB.products.toArray().map((p) => p.title).sort()).toStrictEqual([ 'Banana', 'Mango' ]);

      expect(orderC.user.name).toBe('Jane Doe');
      expect(orderC.products.toArray().length).toBe(3);
      expect(orderC.products.toArray().map((p) => p.title).sort()).toStrictEqual([ 'Apple', 'Banana', 'Mango' ]);
    });
  });

  describe('OrmDeleteRepository', () => {
    it('should prevent cascade deletion', async () => {
      const users = await userRepository.readBy({ });
      let error: any;

      try {
        await userRepository.delete(users);
      }
      catch (e) {
        error = e;
      }

      expect(error.status).toBe(HttpStatus.CONFLICT);
    });

    it('should cascade delete entities', async () => {
      const users = await userRepository.readBy({ });
      const orders = await orderRepository.readBy({ });

      await orderRepository.delete(orders);
      await userRepository.delete(users);

      const userCount = await userRepository.countBy({ });
      const addressCount = await addressRepository.countBy({ });
      const orderCount = await orderRepository.countBy({ });

      expect(userCount).toBe(0);
      expect(addressCount).toBe(0);
      expect(orderCount).toBe(0);
    });
  });
});
