import { DomainError } from "../errors/domain.error";
import { OrderSide } from "../value-objects/order-side.vo";
import { OrderSize } from "../value-objects/order-size.vo";
import { Price } from "../value-objects/price.vo";

export class OrderSizingError extends DomainError { }

export interface SizeResolutionInput {
  side: OrderSide;
  price: Price;
  amount?: number;
  size?: number;
}

export class OrderSizeService {
  resolveSize(input: SizeResolutionInput): OrderSize {
    if (input.side.isCashTransfer()) {
      if (input.amount === undefined) {
        throw new OrderSizingError("Cash transfers require 'amount'.");
      }
      return OrderSize.create(input.amount);
    }
    if (input.size !== undefined) {
      return OrderSize.create(input.size);
    }

    if (input.amount === undefined) {
      throw new OrderSizingError("Provide 'size' or 'amount' for buy/sell orders.");
    }
    const calculatedSize = Math.floor(input.amount / input.price.value);
    if (calculatedSize < 1) {
      throw new OrderSizingError(
        `Insufficient amount: ${input.amount} is not enough to buy at least one unit at price ${input.price.value}.`,
      );
    }
    return OrderSize.create(calculatedSize);
  }
}
