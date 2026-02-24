import { Request, Response } from "express";
import { z } from "zod";
import { GetPortfolioUseCase } from "../../application/use-cases/get-portfolio.use-case";
import { toGetPortfolioResponseDto } from "../http/get-portfolio.response";

const getPortfolioSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

interface Dependencies {
  getPortfolioUseCase: GetPortfolioUseCase;
}

export class PortfolioController {
  private readonly getPortfolioUseCase: GetPortfolioUseCase;

  constructor({ getPortfolioUseCase }: Dependencies) {
    this.getPortfolioUseCase = getPortfolioUseCase;
  }

  async get(req: Request, res: Response): Promise<void> {
    const { userId } = getPortfolioSchema.parse(req.params);
    const result = await this.getPortfolioUseCase.execute({ userId });
    res.status(200).json(toGetPortfolioResponseDto(result));
  }
}
