import { Op } from "sequelize";
import { MarketDataReaderPort, InstrumentPrice } from "../../../domain/ports/market-data-reader.port";
import { InstrumentId } from "../../../domain/value-objects/instrument-id.vo";
import { MarketDataModel } from "../models/marketdata.model";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Dependencies {}

export class MarketDataRepository implements MarketDataReaderPort {
  constructor(_deps: Dependencies) {}

  async getLastCloseByInstrumentId(instrumentId: InstrumentId): Promise<number | undefined> {
    const row = await MarketDataModel.findOne({
      where: { instrumentId: instrumentId.value },
      order: [["date", "DESC"]],
    });

    if (row?.close == null) {
      return undefined;
    }

    return Number(row.close);
  }

  async getPricesByInstrumentIds(ids: InstrumentId[]): Promise<InstrumentPrice[]> {
    if (ids.length === 0) return [];

    const rows = await MarketDataModel.findAll({
      where: { instrumentId: { [Op.in]: ids.map((id) => id.value) } },
      order: [["date", "DESC"]],
    });

    const seen = new Set<number>();
    const result: InstrumentPrice[] = [];
    for (const row of rows) {
      const instrumentId = row.instrumentId ?? undefined;
      if (instrumentId === undefined) continue;
      if (!seen.has(instrumentId) && row.close != null) {
        seen.add(instrumentId);
        result.push({
            instrumentId,
            close: Number(row.close),
            previousClose: row.previousClose != null ? Number(row.previousClose) : undefined,
          });
      }
    }
    return result;
  }
}
