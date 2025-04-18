import { Address, OrderStatus } from '../type';

export type OrderDto = {
  id?: string;
  userId: string;
  items: Array<{ productId: string; count: number }>;
  cartId: string;
  address: Address;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: Date;
    comment: string;
  }>;
};
