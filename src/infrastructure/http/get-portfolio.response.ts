import { GetPortfolioResult } from "../../application/dtos/get-portfolio.result";
import { toCurrency, toPercent } from "../../shared/format.utils";

export interface PortfolioAssetResult {
  instrument: {
    id: number;
    ticker: string;
    description: string;
  };
  quantity: number;
  marketValue: number;
  returnPct: number;
}

export interface GetPortfolioResponseDto {
  totalAccountValue: number;
  pesosBalance: number;
  assets: PortfolioAssetResult[];
}

export function toGetPortfolioResponseDto(result: GetPortfolioResult): GetPortfolioResponseDto {
  return {
    totalAccountValue: toCurrency(result.totalAccountValue),
    pesosBalance: toCurrency(result.pesosBalance),
    assets: result.assets.map((asset) => ({
      instrument: {
        id: asset.instrumentId,
        ticker: asset.ticker,
        description: asset.description,
      },
      quantity: asset.quantity,
      marketValue: toCurrency(asset.marketValue),
      returnPct: toPercent(asset.returnPct),
    })),
  };
}
