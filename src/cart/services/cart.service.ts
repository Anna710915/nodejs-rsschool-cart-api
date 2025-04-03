import { Injectable, NotFoundException } from '@nestjs/common';
import { CartStatuses } from '../models';
import { PutCartPayload } from '../../order/type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity';
import { Product } from '../../entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    return await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });
  }

  async findProductById(id: string): Promise<Product | null> {
    return await this.productRepository.findOne({ where: { id } });
  }

  async createByUserId(userId: string): Promise<Cart> {
    const timestamp = new Date();

    const userCart = this.cartRepository.create({
      userId,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: CartStatuses.OPEN,
      items: [],
    });

    return await this.cartRepository.save(userCart);
  }

  async createProduct(product: Product): Promise<Product> {
    return await this.productRepository.save(product);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return await this.createByUserId(userId);
  }

  async findOrCreateProduct(product: Product): Promise<Product> {
    const found = await this.findProductById(product.id);
    if (found) {
      return found;
    }

    return await this.createProduct(product);
  }

  async updateCart(cart: Cart): Promise<Cart> {
    return await this.cartRepository.save(cart);
  }

  async updateByUserId(userId: string, payload: PutCartPayload): Promise<Cart> {
    const userCart = await this.findOrCreateByUserId(userId);

    const existingItem = await this.cartItemRepository.findOne({
      where: { cart: { id: userCart.id }, product: payload.product },
    });

    if (existingItem) {
      if (payload.count === 0) {
        await this.cartItemRepository.delete(existingItem);
      } else {
        existingItem.count = payload.count;
        await this.cartItemRepository.save(existingItem);
      }
    } else {
      const newItem = this.cartItemRepository.create({
        cart: userCart,
        product: await this.findOrCreateProduct(payload.product),
        count: payload.count,
      });

      await this.cartItemRepository.save(newItem);
    }

    return await this.findByUserId(userId);
  }

  async removeByUserId(userId: string): Promise<void> {
    const userCart = await this.findByUserId(userId);

    if (!userCart) {
      throw new NotFoundException(`Cart for user ${userId} not found`);
    }

    await this.cartRepository.delete(userCart.id);
  }
}
