import { Instrument } from "../entities/instrument.entity";
import { InstrumentId } from "../value-objects/instrument-id.vo";

export interface InstrumentRepositoryPort {
  searchByQuery(query: string): Promise<Instrument[]>;
  findById(id: InstrumentId): Promise<Instrument | undefined>;
  findByIds(ids: InstrumentId[]): Promise<Instrument[]>;
}
