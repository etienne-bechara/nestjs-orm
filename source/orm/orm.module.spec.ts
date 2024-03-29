import { ContextStorage, HttpStatus } from '@bechara/nestjs-core';
import { MikroORM } from '@mikro-orm/core';

import { AddressState } from '../../test/address/address.enum';
import { AddressRepository } from '../../test/address/address.repository';
import { compileTestApp } from '../../test/main';
import { OrderRepository } from '../../test/order/order.repository';
import { ProductRepository } from '../../test/product/product.repository';
import { RelationRepository } from '../../test/relation/relation.repository';
import { UserRepository } from '../../test/user/user.repository';
import { SchemaService } from '../schema/schema.service';
import { OrmQueryOrder, OrmStoreKey } from './orm.enum';

ContextStorage.enterWith(new Map());

describe('OrmModule', () => {
  let schemaService: SchemaService;
  let addressRepository: AddressRepository;
  let orderRepository: OrderRepository;
  let productRepository: ProductRepository;
  let relationRepository: RelationRepository;
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
    relationRepository = app.get(RelationRepository);
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

  describe('OrmSubscriber', () => {
    it('should apply beforeCreate hook', async () => {
      await userRepository.create({
        name: 'After Create Hook',
        age: 10,
      });

      const [ user ] = await userRepository.readBy({ name: 'After Hook' });
      expect(user.name).toBe('After Hook');
    });
  });

  describe('OrmCreateRepository', () => {
    it('should disallow creating entity without mandatory property', async () => {
      let error: any;

      try {
        await userRepository.createOne({ name: 'MISSING_AGE' });
      }
      catch (e) {
        error = e;
      }

      expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should disallow creating entity with duplicate unique key', async () => {
      let error: any;
      await userRepository.createOne({ name: 'DUPLICATE_KEY', age: 20 });

      try {
        await userRepository.createOne({ name: 'DUPLICATE_KEY', age: 20 });
      }
      catch (e) {
        error = e;
      }

      expect(error.status).toBe(HttpStatus.CONFLICT);
    });

    it('should disallow creating entity that reference invalid foreign key', async () => {
      let error: any;

      try {
        await orderRepository.createOne({ user: 'INVALID_USER' });
      }
      catch (e) {
        error = e;
      }

      expect(error.status).toBe(HttpStatus.CONFLICT);
    });

    it('allow persisting entities concurrently', async () => {
      const iterations = 100;
      const promises = [ ];

      const persistFlow = async (i: number): Promise<void> => {
        await userRepository.createOne({ name: `PERSIST_CONCURRENT_${i}_0`, age: i });
        await userRepository.createOne({ name: `PERSIST_CONCURRENT_${i}_1`, age: i });
        await userRepository.create({ name: `PERSIST_CONCURRENT_${i}_2`, age: i });
        await userRepository.create({ name: `PERSIST_CONCURRENT_${i}_3`, age: i });
      };

      for (let i = 0; i < iterations; i++) {
        promises.push(persistFlow(i));
      }

      await Promise.all(promises);
      const userCount = await userRepository.countBy({ name: { $like: 'PERSIST_CONCURRENT%' } });

      expect(userCount).toBe(iterations * 4);
    });

    it('should build an entity and persist only after committing', async () => {
      const user = userRepository.buildOne({
        name: 'PERSIST_AFTER_COMMIT',
        age: 20,
      });

      await userRepository.commit();

      const softCommitCount = await userRepository.countBy({ name: 'PERSIST_AFTER_COMMIT' });
      await userRepository.commit(user);

      const [ john ] = await userRepository.readBy({ name: 'PERSIST_AFTER_COMMIT' });

      expect(softCommitCount).toBe(0);
      expect(john.name).toBe('PERSIST_AFTER_COMMIT');
      expect(john.age).toBe(20);
    });

    it('should create an one-to-one relation to existing entity', async () => {
      await userRepository.createOne({ name: 'ONE_TO_ONE', age: 1 });
      const [ user ] = await userRepository.readBy({ name: 'ONE_TO_ONE' });

      await addressRepository.createOne({
        user,
        zip: '00000000',
        state: AddressState.ES,
      });

      const addresses = await addressRepository.readBy({ user });
      expect(addresses[0].zip).toBe('00000000');
      expect(addresses[0].state).toBe(AddressState.ES);
    });

    it('should create entities with nested one-to-one relations', async () => {
      await userRepository.create([
        {
          name: 'ONE_TO_ONE_NESTED_1',
          age: 30,
          address: { zip: '11111111', state: AddressState.SP },
        },
        {
          name: 'ONE_TO_ONE_NESTED_2',
          age: 40,
          address: { zip: '22222222', state: AddressState.RJ },
        },
      ]);

      const populate = [ 'address' ];
      const [ user1 ] = await userRepository.readBy({ name: 'ONE_TO_ONE_NESTED_1' }, { populate });
      const [ user2 ] = await userRepository.readBy({ name: 'ONE_TO_ONE_NESTED_2' }, { populate });

      expect(user1.age).toBe(30);
      expect(user1.address.zip).toBe('11111111');

      expect(user2.age).toBe(40);
      expect(user2.address.zip).toBe('22222222');
    });

    it('should create entities with nested one-to-many relations', async () => {
      await userRepository.create([
        {
          name: 'ONE_TO_MANY_NESTED_1',
          age: 50,
          metadata: [
            { key: 'ONE_TO_MANY_METADATA_KEY_1', value: 'ONE_TO_MANY_METADATA_VALUE_1' },
          ],
        },
        {
          name: 'ONE_TO_MANY_NESTED_2',
          age: 60,
          metadata: [
            { key: 'ONE_TO_MANY_METADATA_KEY_2', value: 'ONE_TO_MANY_METADATA_VALUE_2' },
            { key: 'ONE_TO_MANY_METADATA_KEY_3', value: 'ONE_TO_MANY_METADATA_VALUE_3' },
          ],
        },
      ]);

      const populate = [ 'metadata' ];
      const [ user1 ] = await userRepository.readBy({ name: 'ONE_TO_MANY_NESTED_1' }, { populate });
      const [ user2 ] = await userRepository.readBy({ name: 'ONE_TO_MANY_NESTED_2' }, { populate });

      expect(user1.age).toBe(50);
      expect(user1.metadata.length).toBe(1);
      expect(user1.metadata[0].key).toBe('ONE_TO_MANY_METADATA_KEY_1');
      expect(user1.metadata[0].value).toBe('ONE_TO_MANY_METADATA_VALUE_1');

      expect(user2.age).toBe(60);
      expect(user2.metadata.length).toBe(2);
      expect(user2.metadata.toArray().map((m) => m.key).sort()).toStrictEqual([
        'ONE_TO_MANY_METADATA_KEY_2',
        'ONE_TO_MANY_METADATA_KEY_3',
      ]);
      expect(user2.metadata.toArray().map((m) => m.value).sort()).toStrictEqual([
        'ONE_TO_MANY_METADATA_VALUE_2',
        'ONE_TO_MANY_METADATA_VALUE_3',
      ]);
    });

    it('should create entities with pivot many-to-many relations', async () => {
      const [ createdUser1, createdUser2 ] = await userRepository.create([
        { name: 'MANY_TO_MANY_PIVOT_1', age: 70 },
        { name: 'MANY_TO_MANY_PIVOT_2', age: 80 },
      ]);

      await relationRepository.create({ child: createdUser1.id, parent: createdUser2.id });

      const populate = [ 'children', 'parents' ];
      const [ user1 ] = await userRepository.readBy({ name: 'MANY_TO_MANY_PIVOT_1' }, { populate });
      const [ user2 ] = await userRepository.readBy({ name: 'MANY_TO_MANY_PIVOT_2' }, { populate });

      expect(user1.age).toBe(70);
      expect(user1.children.length).toBe(0);
      expect(user1.parents.length).toBe(1);
      expect(user1.parents[0].name).toBe('MANY_TO_MANY_PIVOT_2');

      expect(user2.age).toBe(80);
      expect(user2.children.length).toBe(1);
      expect(user2.parents.length).toBe(0);
      expect(user2.children[0].name).toBe('MANY_TO_MANY_PIVOT_1');
    });
  });

  describe('OrmReadRepository', () => {
    it('should read entities respecting order and sort', async () => {
      await userRepository.create([
        { name: '0_SORT_1', age: 10 },
        { name: '0_SORT_2', age: 20 },
        { name: '0_SORT_3', age: 30 },
      ]);

      const { order, sort, records } = await userRepository.readPaginatedBy({
        order: OrmQueryOrder.ASC,
        sort: 'name',
      });

      expect(order).toBe(OrmQueryOrder.ASC);
      expect(sort).toBe('name');
      expect(records[0].name).toBe('0_SORT_1');
      expect(records[2].name).toBe('0_SORT_3');
    });

    it('should read entities respecting limit', async () => {
      const { limit, records } = await userRepository.readPaginatedBy({ limit: 1 });

      expect(limit).toBe(1);
      expect(records.length).toBe(1);
    });

    it('should read entities respecting order, sort, limit and offset', async () => {
      await userRepository.create([
        { name: 'Z_SORT_1', age: 10 },
        { name: 'Z_SORT_2', age: 20 },
        { name: 'Z_SORT_3', age: 30 },
      ]);

      const { order, sort, records, limit, offset } = await userRepository.readPaginatedBy({
        order: OrmQueryOrder.DESC,
        sort: 'name',
        limit: 1,
        offset: 2,
      });

      expect(order).toBe(OrmQueryOrder.DESC);
      expect(sort).toBe('name');
      expect(limit).toBe(1);
      expect(offset).toBe(2);
      expect(records.length).toBe(1);
      expect(records[0].name).toBe('Z_SORT_1');
    });
  });

  describe('OrmUpdateRepository', () => {
    it('should update an existing entity', async () => {
      await productRepository.createOne({ title: 'UPDATE_TARGET', price: 1.23 });
      const [ preUpdate ] = await productRepository.readBy({ title: 'UPDATE_TARGET' });
      const preUpdateCost = preUpdate.price;

      await productRepository.update(preUpdate, { price: 2.34 });
      const [ postUpdate ] = await productRepository.readBy({ title: 'UPDATE_TARGET' });
      const postUpdateCost = postUpdate.price;

      expect(preUpdateCost).toBe(1.23);
      expect(postUpdateCost).toBe(2.34);
    });

    it('should upsert entities accordingly', async () => {
      await productRepository.createOne({ title: 'UPSERT_TARGET_1', price: 1.23 });

      await productRepository.upsert([
        { title: 'UPSERT_TARGET_1', price: 3.45 },
        { title: 'UPSERT_TARGET_2', price: 4.56 },
        { title: 'UPSERT_TARGET_3', price: 5.67 },
      ], {
        uniqueKey: [ 'title' ],
      });

      const [ update1 ] = await productRepository.readBy({ title: 'UPSERT_TARGET_1' });
      const [ update2 ] = await productRepository.readBy({ title: 'UPSERT_TARGET_2' });
      const [ update3 ] = await productRepository.readBy({ title: 'UPSERT_TARGET_3' });

      expect(update1.price).toBe(3.45);
      expect(update2.price).toBe(4.56);
      expect(update3.price).toBe(5.67);
    });

    it('should upsert entities with one-to-many relationships accordingly', async () => {
      await userRepository.create([
        {
          name: 'UPSERT_1M_USER_1',
          age: 10,
          metadata: [
            { key: 'UPSERT_1M_METADATA_KEY_1', value: 'UPSERT_1M_METADATA_VALUE_1' },
          ],
        },
        {
          name: 'UPSERT_1M_USER_2',
          age: 20,
          metadata: [
            { key: 'UPSERT_1M_METADATA_KEY_2', value: 'UPSERT_1M_METADATA_VALUE_2' },
            { key: 'UPSERT_1M_METADATA_KEY_3', value: 'UPSERT_1M_METADATA_VALUE_3' },
          ],
        },
        {
          name: 'UPSERT_1M_USER_3',
          age: 20,
          metadata: [
            { key: 'UPSERT_1M_METADATA_KEY_4', value: 'UPSERT_1M_METADATA_VALUE_4' },
            { key: 'UPSERT_1M_METADATA_KEY_5', value: 'UPSERT_1M_METADATA_VALUE_5' },
            { key: 'UPSERT_1M_METADATA_KEY_6', value: 'UPSERT_1M_METADATA_VALUE_6' },
          ],
        },
      ]);

      await userRepository.upsert([
        {
          name: 'UPSERT_1M_USER_1',
          metadata: [
            { key: 'UPSERT_1M_METADATA_KEY_4', value: 'UPSERT_1M_METADATA_VALUE_4' },
            { key: 'UPSERT_1M_METADATA_KEY_5', value: 'UPSERT_1M_METADATA_VALUE_5' },
          ],
        },
        {
          name: 'UPSERT_1M_USER_2',
          metadata: [
            { key: 'UPSERT_1M_METADATA_KEY_1', value: 'UPSERT_1M_METADATA_VALUE_1' },
            { key: 'UPSERT_1M_METADATA_KEY_2', value: 'UPSERT_1M_METADATA_VALUE_2' },
          ],
        },
        {
          name: 'UPSERT_1M_USER_3',
          metadata: [ ],
        },
      ], {
        uniqueKey: [ 'name' ],
      });

      const populate = [ 'metadata' ];

      const [ user1 ] = await userRepository.readBy({ name: 'UPSERT_1M_USER_1' }, { populate });
      const [ user2 ] = await userRepository.readBy({ name: 'UPSERT_1M_USER_2' }, { populate });
      const [ user3 ] = await userRepository.readBy({ name: 'UPSERT_1M_USER_3' }, { populate });

      expect(user1.metadata.length).toBe(2);
      expect(user1.metadata.toArray().map((m) => m.key).sort()).toStrictEqual([
        'UPSERT_1M_METADATA_KEY_4',
        'UPSERT_1M_METADATA_KEY_5',
      ]);

      expect(user2.metadata.length).toBe(2);
      expect(user2.metadata.toArray().map((m) => m.key).sort()).toStrictEqual([
        'UPSERT_1M_METADATA_KEY_1',
        'UPSERT_1M_METADATA_KEY_2',
      ]);

      expect(user3.metadata.length).toBe(0);
    });

    it('should upsert entities with many-to-many relationships accordingly', async () => {
      const [ user1 ] = await userRepository.create({ name: 'UPSERT_MN_USER_1', age: 10 });
      const [ user2 ] = await userRepository.create({ name: 'UPSERT_MN_USER_2', age: 20 });
      const [ product1 ] = await productRepository.create({ title: 'UPSERT_MN_PRODUCT_1', price: 1 });
      const [ product2 ] = await productRepository.create({ title: 'UPSERT_MN_PRODUCT_2', price: 2 });
      const [ product3 ] = await productRepository.create({ title: 'UPSERT_MN_PRODUCT_3', price: 3 });

      await orderRepository.create([
        { id: 'UPSERT_MN_ORDER_1', user: user1, products: [ product1 ] },
        { id: 'UPSERT_MN_ORDER_2', user: user1, products: [ product1 ] },
      ]);

      await orderRepository.upsert([
        { id: 'UPSERT_MN_ORDER_1', products: [ product2 ] },
        { id: 'UPSERT_MN_ORDER_2', user: user1, products: [ product2, product3 ] },
        { id: 'UPSERT_MN_ORDER_3', user: user2, products: [ product1, product2, product3 ] },
      ], {
        uniqueKey: [ 'id' ],
      });

      const populate = [ 'user', 'products' ];
      const order1 = await orderRepository.readByIdOrFail('UPSERT_MN_ORDER_1', { populate });
      const order2 = await orderRepository.readByIdOrFail('UPSERT_MN_ORDER_2', { populate });
      const order3 = await orderRepository.readByIdOrFail('UPSERT_MN_ORDER_3', { populate });

      expect(order1.user.name).toBe('UPSERT_MN_USER_1');
      expect(order1.products.toArray().length).toBe(1);
      expect(order1.products.toArray().map((p) => p.title).sort()).toStrictEqual([ 'UPSERT_MN_PRODUCT_2' ]);

      expect(order2.user.name).toBe('UPSERT_MN_USER_1');
      expect(order2.products.toArray().length).toBe(2);
      expect(order2.products.toArray().map((p) => p.title).sort()).toStrictEqual([
        'UPSERT_MN_PRODUCT_2',
        'UPSERT_MN_PRODUCT_3',
      ]);

      expect(order3.user.name).toBe('UPSERT_MN_USER_2');
      expect(order3.products.toArray().length).toBe(3);
      expect(order3.products.toArray().map((p) => p.title).sort()).toStrictEqual([
        'UPSERT_MN_PRODUCT_1',
        'UPSERT_MN_PRODUCT_2',
        'UPSERT_MN_PRODUCT_3',
      ]);
    });
  });

  describe('OrmDeleteRepository', () => {
    it('should prevent cascade deletion', async () => {
      const users = await userRepository.readBy({ }, { populate: [ 'address', 'metadata', 'orders' ] });
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
      const users = await userRepository.readBy({ }, { populate: [ 'address', 'metadata' ] });
      const orders = await orderRepository.readBy({ });
      const relations = await relationRepository.readBy({ });

      await relationRepository.delete(relations);
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
