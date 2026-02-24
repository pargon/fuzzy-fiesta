import { EntityId } from "../value-objects/entity-id.vo";
import { MarketDate } from "../value-objects/market-date.vo";
import { Price } from "../value-objects/price.vo";
import { DomainError } from "../errors/domain.error";

export class MarketDataValidationError extends DomainError {}

export interface MarketDataProps {
  id?: number;
  instrumentId: number;
  high: number;
  low: number;
  open: number;
  close: number;
  previousClose: number;
  date: string;
}

export class MarketData {
  private constructor(
    public readonly id: EntityId | undefined,
    public readonly instrumentId: EntityId,
    public readonly high: Price,
    public readonly low: Price,
    public readonly open: Price,
    public readonly close: Price,
    public readonly previousClose: Price,
    public readonly date: MarketDate,
  ) {
    Object.freeze(this);
  }

  static create(props: MarketDataProps): MarketData {
    const high = Price.create(props.high);
    const low = Price.create(props.low);

    if (high.value < low.value) {
      throw new MarketDataValidationError("High price cannot be lower than low price.");
    }

    return new MarketData(
      props.id !== undefined ? EntityId.create(props.id) : undefined,
      EntityId.create(props.instrumentId),
      high,
      low,
      Price.create(props.open),
      Price.create(props.close),
      Price.create(props.previousClose),
      MarketDate.create(props.date),
    );
  }
}
