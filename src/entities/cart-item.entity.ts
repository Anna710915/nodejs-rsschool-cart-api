import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from './product.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryColumn({ name: 'cart_id', type: 'uuid' })
  cartId: string;

  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId: string;

  @JoinColumn({ name: 'cart_id' })
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @JoinColumn({ name: 'product_id' })
  @ManyToOne(() => Product)
  product: Product;

  @Column({ type: 'int', default: 1 })
  count: number;
}
