import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { OrderDto, OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { CreateOrderDto, OrderStatus, PutCartPayload } from '../order/type';
import { CartItem } from '../entities/cart-item.entity';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest): Promise<CartItem[]> {
    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req),
    );

    return cart.items;
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: PutCartPayload,
  ): Promise<CartItem[]> {
    // TODO: validate body payload...
    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      body,
    );

    return cart.items;
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearUserCart(@Req() req: AppRequest) {
    await this.cartService.removeByUserId(getUserIdFromRequest(req));
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put('order')
  async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      throw new BadRequestException('Cart is empty');
    }

    const { id: cartId, items } = cart;
    const total = calculateCartTotal(items);
    const order = await this.orderService.create({
      userId,
      cartId,
      items: items.map(({ product, count }) => ({
        productId: product.id,
        count,
      })),
      address: body.address,
      total,
      payment: {
        type: 'CREDIT_CARD',
        address: body.address.address,
        creditCard: '0000-0000-0000-0000',
      },
      delivery: {
        address: body.address,
      },
      comments: body.address.comment,
      status: OrderStatus.Pending,
      statusHistory: [
        {
          status: OrderStatus.Pending,
          timestamp: new Date(),
          comment: 'Order has been created',
        },
      ],
    });

    return {
      order,
    };
  }

  @UseGuards(BasicAuthGuard)
  @Get('order')
  async getOrders(): Promise<OrderDto[]> {
    return await this.orderService.getAll();
  }

  @UseGuards(BasicAuthGuard)
  @Get('order/:orderId')
  async getOrder(@Param('orderId') orderId: string) {
    return await this.orderService.getDtoById(orderId);
  }

  @UseGuards(BasicAuthGuard)
  @Delete('order/:orderId')
  async deleteOrder(@Param('orderId') orderId: string) {
    return await this.orderService.delete(orderId);
  }
}
