import { Order } from "../../domain/entities/order.entity";
import { CreateOrderResult } from "../../application/dtos/create-order.result";
import { toCurrency } from "../../shared/format.utils";

export interface OrderResponseDto {
  id?: number;
  instrumentId?: number;
  userId?: number;
  size: number;
  price: number;
  type?: string;
  side: string;
  status: string;
  datetime?: string;
}

export interface CreateOrderResponseDto {
  order: OrderResponseDto;
}

export function toOrderResponseDto(order: Order): OrderResponseDto {
  return {
    id: order.id?.value,
    instrumentId: order.instrumentId?.value,
    userId: order.userId?.value,
    size: order.size.value,
    price: toCurrency(order.price.value),
    type: order.type?.value,
    side: order.side.value,
    status: order.status.value,
    datetime: order.datetime?.value.toISOString(),
  };
}

export function toCreateOrderResponseDto(result: CreateOrderResult): CreateOrderResponseDto {
  return { order: toOrderResponseDto(result.order) };
}
