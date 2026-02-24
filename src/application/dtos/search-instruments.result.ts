import { Instrument } from "../../domain/entities/instrument.entity";
import { InstrumentPrice } from "../../domain/ports/market-data-reader.port";

export interface SearchInstrumentsResult {
  instruments: Instrument[];
  prices: InstrumentPrice[];
}
