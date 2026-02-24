import { EntityId } from "../value-objects/entity-id.vo";
import { InstrumentId } from "../value-objects/instrument-id.vo";
import { UserId } from "../value-objects/user-id.vo";
import { OrderDatetime } from "../value-objects/order-datetime.vo";
import { OrderSide } from "../value-objects/order-side.vo";
import { OrderSize } from "../value-objects/order-size.vo";
import { OrderStatus, ORDER_STATUS } from "../value-objects/order-status.vo";
import { OrderType } from "../value-objects/order-type.vo";
import { Price } from "../value-objects/price.vo";
import { OrderNotCancellableError } from "../errors/order-not-cancellable.error";
import { OrderNotFoundError } from "../errors/order-not-found.error";

export interface OrderProps {
  instrumentId: number;
  userId: number;
  size: number;
  price: number;
  type: string;
  side: string;
  status: string;
  datetime: Date;
}

export interface ReconstitueOrderProps {
  id: number;
  instrumentId?: number;
  userId?: number;
  size?: number;
  price?: number;
  type?: string;
  side?: string;
  status?: string;
  datetime?: Date;
}

export class Order {
  private constructor(
    public readonly id: EntityId | undefined,
    public readonly instrumentId: InstrumentId,
    public readonly userId: UserId,
    public readonly size: OrderSize,
    public readonly price: Price,
    public readonly type: OrderType,
    public readonly side: OrderSide,
    public readonly status: OrderStatus,
    public readonly datetime: OrderDatetime,
  ) {
    Object.freeze(this);
  }

  static create(props: OrderProps): Order {
    return new Order(
      undefined,
      InstrumentId.create(props.instrumentId),
      UserId.create(props.userId),
      OrderSize.create(props.size),
      Price.create(props.price),
      OrderType.create(props.type),
      OrderSide.create(props.side),
      OrderStatus.create(props.status),
      OrderDatetime.create(props.datetime),
    );
  }

  static reconstitute(props: ReconstitueOrderProps): Order {
    if (props.instrumentId === undefined || props.userId === undefined) {
      throw new Error(`Critical data missing for Order ${props.id}`);
    }
    if (props.side === undefined || props.size === undefined) {
      throw new Error(`Critical data missing for Order ${props.id}. Side and Size are required for portfolio calculation.`);
    }
    const side = OrderSide.create(props.side);
    const resolvedStatus = (props.status == null && side.isCashTransfer()) ? "FILLED" : props.status;
    return new Order(
      EntityId.create(props.id),
      InstrumentId.create(props.instrumentId),
      UserId.create(props.userId),
      OrderSize.create(props.size),
      Price.fromPersistence(props.price, props.type),
      OrderType.fromLegacy(props.type),
      side,
      OrderStatus.fromLegacy(resolvedStatus),
      OrderDatetime.reconstitute(props.datetime)
    );
  }

  cancel(requestingUserId: UserId): Order {
    if (this.userId === undefined || this.userId.value !== requestingUserId.value) {
      throw new OrderNotFoundError(`Order not found for user ${requestingUserId.value}.`);
    }
    if (!this.status.isNew()) {
      throw new OrderNotCancellableError(
        `Order cannot be cancelled: current status is ${this.status.value}. Only NEW orders can be cancelled.`);
    }
    return new Order(
      this.id,
      this.instrumentId,
      this.userId,
      this.size,
      this.price,
      this.type,
      this.side,
      OrderStatus.cancelled(),
      this.datetime,
    );
  }
}
