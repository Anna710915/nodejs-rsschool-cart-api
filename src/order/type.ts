export enum OrderStatus {
  Pending = 'PENDING',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}

export type Address = {
  address: string;
  firstName: string;
  lastName: string;
  comment: string;
};

export type CreateOrderDto = {
  items: Array<{ productId: string; count: 1 }>;
  address: {
    comment: string;
    address: string;
    lastName: string;
    firstName: string;
  };
};

export type Payment = {
  type: string;
  address?: any;
  creditCard?: any;
};

export type Delivery = {
  address: any;
};

export type StatusHistory = {
  status: string;
  timestamp: Date;
  comment?: string;
};

export type PutCartPayload = {
  product: { description: string; id: string; title: string; price: number };
  count: number;
};

export type CreateOrderPayload = {
  userId: string;
  cartId: string;
  items: Array<{ productId: string; count: number }>;
  payment: Payment,
  delivery: Delivery,
  statusHistory:  StatusHistory[],
  comments: string,
  address: Address;
  status: OrderStatus,
  total: number;
};
