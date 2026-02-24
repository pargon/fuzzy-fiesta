import { Request, Response } from "express";
import { z } from "zod";
import { SearchInstrumentsUseCase } from "../../application/use-cases/search-instruments.use-case";
import { toSearchInstrumentsResponseDto } from "../http/search-instruments.response";

const searchInstrumentsSchema = z.object({
  q: z.string().min(1, "Search query cannot be empty."),
});

interface Dependencies {
  searchInstrumentsUseCase: SearchInstrumentsUseCase;
}

export class InstrumentController {
  private readonly searchInstrumentsUseCase: SearchInstrumentsUseCase;

  constructor({ searchInstrumentsUseCase }: Dependencies) {
    this.searchInstrumentsUseCase = searchInstrumentsUseCase;
  }

  async search(req: Request, res: Response): Promise<void> {
    const query = searchInstrumentsSchema.parse(req.query);
    const result = await this.searchInstrumentsUseCase.execute(query);
    res.status(200).json(toSearchInstrumentsResponseDto(result));
  }
}
