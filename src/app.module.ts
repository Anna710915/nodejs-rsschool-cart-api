import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';
import { Order } from './entities/order.entity';
import { Product } from './entities/product.entity';

@Module({
  imports: [
    AuthModule, 
    CartModule, 
    OrderModule, 
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        CartItem,
        Cart,
        Order,
        Product
      ],
      synchronize: false, 
      ssl: false,
      retryAttempts: 0,  
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
