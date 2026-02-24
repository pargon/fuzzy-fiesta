import { InstrumentId } from "../value-objects/instrument-id.vo";

export interface InstrumentPrice {
  instrumentId: number;
  close: number;
  previousClose?: number;
}

export interface MarketDataReaderPort {
  getLastCloseByInstrumentId(instrumentId: InstrumentId): Promise<number | undefined>;
  getPricesByInstrumentIds(ids: InstrumentId[]): Promise<InstrumentPrice[]>;
}
