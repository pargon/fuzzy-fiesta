import { SearchInstrumentsResult } from "../../application/dtos/search-instruments.result";
import { toPercent } from "../../shared/format.utils";
import { calcDailyReturn } from "../../shared/market.utils";

export interface InstrumentResponseDto {
  id: number | undefined;
  ticker: string;
  name: string;
  type: string;
  marketPrice: number | undefined;
  returnPct: number;
}

export interface SearchInstrumentsResponseDto {
  instruments: InstrumentResponseDto[];
}

export function toSearchInstrumentsResponseDto(result: SearchInstrumentsResult): SearchInstrumentsResponseDto {
  const priceMap = new Map(result.prices.map((p) => [p.instrumentId, p]));
  return {
    instruments: result.instruments.map((instrument) => {
      const priceEntry = instrument.id ? priceMap.get(instrument.id.value) : undefined;
      const returnPct = priceEntry ? calcDailyReturn(priceEntry.close, priceEntry.previousClose) : 0;
      return {
        id: instrument.id?.value,
        ticker: instrument.ticker.value,
        name: instrument.name.value,
        type: instrument.type.value,
        marketPrice: priceEntry?.close,
        returnPct: toPercent(returnPct),
      };
    }),
  };
}
