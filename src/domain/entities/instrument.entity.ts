import { EntityId } from "../value-objects/entity-id.vo";
import { InstrumentName } from "../value-objects/instrument-name.vo";
import { InstrumentType } from "../value-objects/instrument-type.vo";
import { Ticker } from "../value-objects/ticker.vo";

export interface InstrumentProps {
  id: number;
  ticker: string;
  name: string;
  type: string;
}

export class Instrument {
  private constructor(
    public readonly id: EntityId,
    public readonly ticker: Ticker,
    public readonly name: InstrumentName,
    public readonly type: InstrumentType,
  ) {
    Object.freeze(this);
  }

  static create(props: InstrumentProps): Instrument {
    return new Instrument(
      EntityId.create(props.id),
      Ticker.create(props.ticker),
      InstrumentName.create(props.name),
      InstrumentType.create(props.type),
    );
  }
}
