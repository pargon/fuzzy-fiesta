import { AssetPosition } from "./portfolio-from-filled-orders.service";
import { Instrument } from "../entities/instrument.entity";
import { OrderSide } from "../value-objects/order-side.vo";
import { OrderSize } from "../value-objects/order-size.vo";
import { Price } from "../value-objects/price.vo";

export type AvailabilityResult =
  | { success: true }
  | { success: false; reason: string };

export interface AvailabilityInput {
  side: OrderSide;
  instrument: Instrument;
  size: OrderSize;
  price: Price;
  pesosBalance: number;
  assets: AssetPosition[];
}

export class OrderAvailabilityService {
  validate(input: AvailabilityInput): AvailabilityResult {
    const orderAmount = input.size.value * input.price.value;

    if (input.side.isBuy() || input.side.isCashOut()) {
      if (orderAmount > input.pesosBalance) {
        return { success: false, reason: `Insufficient funds for ${input.side.value} order.` };
      }
    }

    if (input.side.isSell()) {
      const currentHolding = input.assets.find((a) => a.instrumentId === input.instrument.id.value)?.quantity ?? 0;
      if (input.size.value > currentHolding) {
        return { success: false, reason: "Insufficient shares for SELL order." };
      }
    }

    return { success: true };
  }
}
