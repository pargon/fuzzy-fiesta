import { Order } from "../../domain/entities/order.entity";

export interface CancelOrderResult {
  order: Order;
}
