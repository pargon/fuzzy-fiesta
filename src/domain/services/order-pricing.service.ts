import { MarketDataReaderPort } from "../ports/market-data-reader.port";
import { DomainError } from "../errors/domain.error";
import { Instrument } from "../entities/instrument.entity";
import { OrderSide } from "../value-objects/order-side.vo";
import { OrderType } from "../value-objects/order-type.vo";
import { Price } from "../value-objects/price.vo";

export class OrderPricingError extends DomainError {}

export interface PriceResolutionInput {
  side: OrderSide;
  instrument: Instrument;
  type: OrderType;
  price?: number;
}

interface Dependencies {
  marketDataReader: MarketDataReaderPort;
}

export class OrderPricingService {
  private readonly marketDataReader: MarketDataReaderPort;

  constructor({ marketDataReader }: Dependencies) {
    this.marketDataReader = marketDataReader;
  }

  async resolveUnitPrice(input: PriceResolutionInput): Promise<Price> {
    if (input.side.isCashTransfer()) {
      return Price.create(1);
    }
    if (input.type.isLimit()) {
      if (input.price === undefined) {
        throw new OrderPricingError("Limit order requires price.");
      }
      return Price.create(input.price);
    }
    const marketPrice = await this.marketDataReader.getLastCloseByInstrumentId(input.instrument.id);
    if (marketPrice === undefined) {
      throw new OrderPricingError(`No market close price found for instrument ${input.instrument.ticker.value}.`);
    }

    return Price.create(marketPrice);
  }
}
