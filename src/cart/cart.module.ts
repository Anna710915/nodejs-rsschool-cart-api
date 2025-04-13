import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { CartController } from './cart.controller';
import { CartService } from './services';
import { Cart } from '../entities/cart.entity';
import { Product } from '../entities/product.entity';
import { CartItem } from '../entities/cart-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [OrderModule, TypeOrmModule.forFeature([Cart, Product, CartItem])],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
