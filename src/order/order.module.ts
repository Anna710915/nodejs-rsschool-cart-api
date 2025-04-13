import { Module } from '@nestjs/common';
import { OrderService } from './services';
import { Order } from '../entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [OrderService],
  exports: [OrderService],
  imports: [TypeOrmModule.forFeature([Order])],
})
export class OrderModule {}
