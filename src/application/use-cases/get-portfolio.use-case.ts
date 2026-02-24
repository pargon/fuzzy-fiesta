import { UserId } from "../../domain/value-objects/user-id.vo";
import { GetPortfolioQuery } from "../dtos/get-portfolio.query";
import { GetPortfolioResult } from "../dtos/get-portfolio.result";
import { IPortfolioApplicationService } from "../ports/portfolio-application-service.port";

interface Dependencies {
  portfolioApplicationService: IPortfolioApplicationService;
}

export class GetPortfolioUseCase {
  private readonly portfolioApplicationService: IPortfolioApplicationService;

  constructor({ portfolioApplicationService }: Dependencies) {
    this.portfolioApplicationService = portfolioApplicationService;
  }

  async execute(query: Readonly<GetPortfolioQuery>): Promise<GetPortfolioResult> {
    return this.portfolioApplicationService.calculateForUser(UserId.create(query.userId));
  }
}
