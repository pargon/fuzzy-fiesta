import { Order } from "../entities/order.entity";
import { calcDailyReturn } from "../../shared/market.utils";
import { IPortfolioCalculatorPort } from "../ports/portfolio-calculator.port";

export interface InstrumentInfo {
  ticker: string;
  description: string;
}

export interface AssetPosition {
  instrumentId: number;
  quantity: number;
}

export interface AssetPerformance extends AssetPosition {
  ticker: string;
  description: string;
  averageCost: number;
  currentPrice: number;
  investedCost: number;
  marketValue: number;
  unrealizedPnl: number;
  returnPct: number;
}

export interface PortfolioResult {
  totalAccountValue: number;
  pesosBalance: number;
  assets: AssetPerformance[];
}

export interface OrderAvailability {
  pesosBalance: number;
  assets: AssetPosition[];
}

interface PositionAccumulator {
  quantity: number;
  investedCost: number;
  currentPrice: number;
}

export class PortfolioFromFilledOrdersService implements IPortfolioCalculatorPort {
  calculatePositions(orders: Order[]): OrderAvailability {
    const { positions, pesosBalance } = this.buildPositions(orders);

    const assets: AssetPosition[] = [...positions.entries()]
      .filter(([, p]) => p.quantity > 0)
      .map(([instrumentId, p]) => ({ instrumentId, quantity: p.quantity }));

    return { pesosBalance, assets };
  }

  calculate(
    orders: Order[],
    instrumentMap: Map<number, InstrumentInfo> = new Map(),
    priceMap: Map<number, { close: number; previousClose?: number }> = new Map(),
  ): PortfolioResult {
    const { positions, pesosBalance } = this.buildPositions(orders);

    const assets = this.buildAssets(positions, instrumentMap, priceMap);
    const totalAccountValue = pesosBalance + assets.reduce((sum, a) => sum + a.marketValue, 0);

    return { totalAccountValue, pesosBalance, assets };
  }

  private buildPositions(orders: Order[]): { positions: Map<number, PositionAccumulator>; pesosBalance: number } {
    const positions = new Map<number, PositionAccumulator>();
    let pesosBalance = 0;

    for (const order of orders) {
      const side = order.side;
      const price = order.price.value;
      const quantity = order.size.value;
      const instrumentId = order.instrumentId?.value;
      if (instrumentId === undefined) continue;

      if (side.isCashTransfer()) {
        pesosBalance += this.applyTransfer(side.isCashOut(), quantity);
        continue;
      }

      const position = positions.get(instrumentId) ?? { quantity: 0, investedCost: 0, currentPrice: price };

      if (side.isBuy()) {
        pesosBalance -= quantity * price;
        positions.set(instrumentId, this.applyBuy(position, quantity, price));
        continue;
      }

      if (side.isSell()) {
        pesosBalance += quantity * price;
        positions.set(instrumentId, this.applySell(position, quantity, price));
        continue;
      }
    }

    return { positions, pesosBalance };
  }

  private applyTransfer(isCashOut: boolean, amount: number): number {
    return isCashOut ? -amount : amount;
  }

  private applyBuy(position: PositionAccumulator, quantity: number, price: number): PositionAccumulator {
    return {
      quantity: position.quantity + quantity,
      investedCost: position.investedCost + quantity * price,
      currentPrice: price,
    };
  }

  private applySell(position: PositionAccumulator, quantity: number, price: number): PositionAccumulator {
    const averageCost = position.quantity > 0 ? position.investedCost / position.quantity : 0;
    const remainingQuantity = position.quantity - quantity;

    return {
      quantity: remainingQuantity,
      investedCost: remainingQuantity === 0 ? 0 : position.investedCost - averageCost * quantity,
      currentPrice: price,
    };
  }

  private buildAssets(
    positions: Map<number, PositionAccumulator>,
    instrumentMap: Map<number, InstrumentInfo>,
    priceMap: Map<number, { close: number; previousClose?: number }>,
  ): AssetPerformance[] {
    return [...positions.entries()]
      .filter(([, position]) => position.quantity > 0)
      .map(([instrumentId, position]) => {
        const info = instrumentMap.get(instrumentId) ?? { ticker: "N/A", description: "Unknown" };
        const marketEntry = priceMap.get(instrumentId);
        const currentPrice = marketEntry?.close ?? position.currentPrice;
        const marketValue = position.quantity * currentPrice;
        const unrealizedPnl = marketValue - position.investedCost;
        const averageCost = position.investedCost / position.quantity;

        const returnPct = calcDailyReturn(currentPrice, marketEntry?.previousClose);

        return {
          instrumentId,
          ticker: info.ticker,
          description: info.description,
          quantity: position.quantity,
          averageCost,
          currentPrice,
          investedCost: position.investedCost,
          marketValue,
          unrealizedPnl,
          returnPct,
        };
      });
  }
}
