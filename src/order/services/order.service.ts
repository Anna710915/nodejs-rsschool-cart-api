import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderPayload, OrderStatus } from '../type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDto } from '../models';
import { Order } from '../../entities/order.entity';
import { Cart } from '../../entities/cart.entity';
import { CartStatuses } from '../../cart';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>
  ) {}

  async getAll(): Promise<OrderDto[]> {
    const orders = await this.orderRepository.find({
      relations: ['cart', 'cart.items'],
    });

    return orders.map((order) => ({
      ...order,
      items: order.cart.items,
      statusHistory: [{
        status: order.status,
        timestamp: order.createdAt,
        comment: order.comments
      }],
      address: {
        address: JSON.stringify(order.delivery),
        firstName: "",
        lastName: "",
        comment: order.comments,
      }
    }));
  }

  async findById(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['cart', 'cart.items', 'cart.items.product'],
    });

    return order;
  }

  async getDtoById(orderId: string): Promise<OrderDto> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['cart', 'cart.items', 'cart.items.product'],
      });

      return { ...order, items: order.cart.items,
        statusHistory: [{
          status: order.status,
          timestamp: order.createdAt,
          comment: order.comments
        }],
        address: {
          address: JSON.stringify(order.delivery),
          firstName: "",
          lastName: "",
          comment: order.comments,
        }
       };
    } catch (error) {
      return null;
    }
  }

  async create(data: CreateOrderPayload): Promise<Order> {
    const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = this.orderRepository.create({
        ...data,
        status: OrderStatus.Pending,
      });
      const created = await queryRunner.manager.save(order);
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { id: created.cartId },
      });
      if (!cart) {
        throw new Error("Cart not found");
      }
      cart.status = CartStatuses.ORDERED;
      await queryRunner.manager.save(cart);
      await queryRunner.commitTransaction();
      return created;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(orderId: string, data: Partial<Order>): Promise<Order> {
    const order = await this.findById(orderId);
    const updatedOrder = Object.assign(order, data);
    return await this.orderRepository.save(updatedOrder);
  }

  async delete(orderId: string) {
    const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await this.findById(orderId);
      await queryRunner.manager.delete(Order, orderId);
      await queryRunner.manager.update(Cart, order.cartId, {
        status: CartStatuses.OPEN,
      });
      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }
}
