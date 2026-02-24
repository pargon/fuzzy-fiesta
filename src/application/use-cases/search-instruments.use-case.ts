import { InstrumentRepositoryPort } from "../../domain/ports/instrument-repository.port";
import { MarketDataReaderPort } from "../../domain/ports/market-data-reader.port";
import { InstrumentId } from "../../domain/value-objects/instrument-id.vo";
import { SearchInstrumentsQuery } from "../dtos/search-instruments.query";
import { SearchInstrumentsResult } from "../dtos/search-instruments.result";

interface Dependencies {
  instrumentRepository: InstrumentRepositoryPort;
  marketDataReader: MarketDataReaderPort;
}

export class SearchInstrumentsUseCase {
  private readonly instrumentRepository: InstrumentRepositoryPort;
  private readonly marketDataReader: MarketDataReaderPort;

  constructor({ instrumentRepository, marketDataReader }: Dependencies) {
    this.instrumentRepository = instrumentRepository;
    this.marketDataReader = marketDataReader;
  }

  async execute(query: Readonly<SearchInstrumentsQuery>): Promise<SearchInstrumentsResult> {
    const instruments = await this.instrumentRepository.searchByQuery(query.q.trim());
    const ids = instruments
      .filter((i) => i.id !== undefined)
      .map((i) => InstrumentId.create(i.id!.value));
    const prices = await this.marketDataReader.getPricesByInstrumentIds(ids);
    return { instruments, prices };
  }
}
