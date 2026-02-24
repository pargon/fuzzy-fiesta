import { Order } from "../entities/order.entity";
import { Instrument } from "../entities/instrument.entity";
import { OrderDatetime } from "../value-objects/order-datetime.vo";
import { OrderSide } from "../value-objects/order-side.vo";
import { OrderSize } from "../value-objects/order-size.vo";
import { OrderType } from "../value-objects/order-type.vo";
import { OrderStatus } from "../value-objects/order-status.vo";
import { Price } from "../value-objects/price.vo";
import { UserId } from "../value-objects/user-id.vo";
import { IncompatibleInstrumentError } from "../errors/incompatible-instrument.error";

interface BaseOrderInput {
  userId: UserId;
  instrument: Instrument;
  side: OrderSide;
  type: OrderType;
  size: OrderSize;
  price: Price;
  datetime: OrderDatetime;
}

export class OrderFactoryService {
  validateInstrumentCompatibility(instrument: Instrument, side: OrderSide, type: OrderType): void {
    const isCurrency = instrument.type.isCurrency();
    const isCashTransfer = side.isCashTransfer();

    if (isCurrency && !isCashTransfer) {
      throw new IncompatibleInstrumentError(
        `Instrument of type MONEDA can only be used with CASH_IN or CASH_OUT orders.`,
      );
    }

    if (!isCurrency && isCashTransfer) {
      throw new IncompatibleInstrumentError(
        `CASH_IN and CASH_OUT orders require an instrument of type MONEDA.`,
      );
    }

    if (isCashTransfer && !type.isMarket()) {
      throw new IncompatibleInstrumentError(
        `CASH_IN and CASH_OUT orders must be of type MARKET.`,
      );
    }
  }

  createRejected(input: BaseOrderInput): Order {
    return this.build(input, OrderStatus.rejected());
  }

  createAccepted(input: BaseOrderInput): Order {
    const status = input.type.isLimit() ? OrderStatus.new() : OrderStatus.filled();
    return this.build(input, status);
  }

  private build(input: BaseOrderInput, status: OrderStatus): Order {
    return Order.create({
      userId: input.userId.value,
      instrumentId: input.instrument.id.value,
      side: input.side.value,
      type: input.type.value,
      size: input.size.value,
      price: input.price.value,
      status: status.value,
      datetime: input.datetime.value,
    });
  }
}
