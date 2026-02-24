import { Op } from "sequelize";
import { Instrument } from "../../../domain/entities/instrument.entity";
import { InstrumentRepositoryPort } from "../../../domain/ports/instrument-repository.port";
import { InstrumentId } from "../../../domain/value-objects/instrument-id.vo";
import { InstrumentModel } from "../models/instruments.model";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Dependencies {}

export class InstrumentRepository implements InstrumentRepositoryPort {
  constructor(_deps: Dependencies) {}

  async searchByQuery(query: string): Promise<Instrument[]> {
    const pattern = `%${query}%`;

    const rows = await InstrumentModel.findAll({
      where: {
        [Op.or]: [
          { ticker: { [Op.iLike]: pattern } },
          { name: { [Op.iLike]: pattern } },
        ],
      },
      order: [["ticker", "ASC"]],
    });

    return rows.map((row) =>
      Instrument.create({
        id: row.id,
        ticker: row.ticker ?? "",
        name: row.name ?? "",
        type: row.type ?? "",
      }),
    );
  }

  async findById(id: InstrumentId): Promise<Instrument | undefined> {
    const row = await InstrumentModel.findByPk(id.value);
    if (row === null) {
      return undefined;
    }

    return Instrument.create({
      id: row.id,
      ticker: row.ticker ?? "",
      name: row.name ?? "",
      type: row.type ?? "",
    });
  }

  async findByIds(ids: InstrumentId[]): Promise<Instrument[]> {
    if (ids.length === 0) return [];

    const rows = await InstrumentModel.findAll({
      where: { id: { [Op.in]: ids.map((id) => id.value) } },
    });

    return rows.map((row) =>
      Instrument.create({
        id: row.id,
        ticker: row.ticker ?? "",
        name: row.name ?? "",
        type: row.type ?? "",
      }),
    );
  }

}
