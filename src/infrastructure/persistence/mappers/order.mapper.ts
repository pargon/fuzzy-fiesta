import { CreationAttributes } from "sequelize";
import { Order } from "../../../domain/entities/order.entity";
import { OrderModel } from "../models/orders.model";

const LEGACY_DATE_FALLBACK = new Date("2020-01-01T00:00:00Z");

export class OrderMapper {
  static toDomain(model: OrderModel): Order {
    return Order.reconstitute({
      id: model.id,
      instrumentId: model.instrumentId ?? undefined,
      userId: model.userId ?? undefined,
      size: model.size ?? undefined,
      price: model.price ? Number(model.price) : undefined,
      type: model.type ?? undefined,
      side: model.side ?? undefined,
      status: model.status ?? undefined,
      datetime: model.datetime ?? LEGACY_DATE_FALLBACK,
    });
  }

  static toPersistence(order: Order): CreationAttributes<OrderModel> {
    return {
      instrumentId: order.instrumentId.value,
      userId: order.userId.value,
      size: order.size.value,
      price: String(order.price.value),
      type: order.type.value,
      side: order.side.value,
      status: order.status.value,
      datetime: order.datetime.value,
    };
  }
}
