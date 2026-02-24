import { Order } from "../entities/order.entity";
import { InstrumentInfo, OrderAvailability, PortfolioResult } from "../services/portfolio-from-filled-orders.service";

export interface IPortfolioCalculatorPort {
  calculatePositions(orders: Order[]): OrderAvailability;
  calculate(
    orders: Order[],
    instrumentMap: Map<number, InstrumentInfo>,
    priceMap: Map<number, { close: number; previousClose?: number }>,
  ): PortfolioResult;
}
