import { PortfolioFromFilledOrdersService, InstrumentInfo } from "./portfolio-from-filled-orders.service";
import { Order } from "../entities/order.entity";

const BASE_DATE = new Date("2025-01-10T10:00:00.000Z");

const INSTRUMENT_MAP = new Map<number, InstrumentInfo>([
  [1, { ticker: "GGAL", description: "Grupo Galicia" }],
  [2, { ticker: "PAMP", description: "Pampa Energía" }],
  [3, { ticker: "YPF",  description: "YPF S.A." }],
]);

function makeOrder(overrides: {
  side: string;
  size: number;
  price: number;
  instrumentId?: number;
  userId?: number;
}): Order {
  return Order.reconstitute({
    id: Math.floor(Math.random() * 10000),
    userId: overrides.userId ?? 1,
    instrumentId: overrides.instrumentId ?? 1,
    side: overrides.side,
    type: "MARKET",
    status: "FILLED",
    size: overrides.size,
    price: overrides.price,
    datetime: BASE_DATE,
  });
}

describe("PortfolioFromFilledOrdersService", () => {
  let service: PortfolioFromFilledOrdersService;

  beforeEach(() => {
    service = new PortfolioFromFilledOrdersService();
  });

  describe("empty portfolio", () => {
    it("returns zero balance and no assets for empty orders", () => {
      const result = service.calculate([]);
      expect(result.pesosBalance).toBe(0);
      expect(result.assets).toHaveLength(0);
    });
  });

  describe("CASH_IN / CASH_OUT", () => {
    it("increases pesosBalance on CASH_IN", () => {
      const result = service.calculate([makeOrder({ side: "CASH_IN", size: 5000, price: 1 })]);
      expect(result.pesosBalance).toBe(5000);
    });

    it("decreases pesosBalance on CASH_OUT", () => {
      const orders = [
        makeOrder({ side: "CASH_IN", size: 10000, price: 1 }),
        makeOrder({ side: "CASH_OUT", size: 3000, price: 1 }),
      ];
      const result = service.calculate(orders);
      expect(result.pesosBalance).toBe(7000);
    });
  });

  describe("BUY orders", () => {
    it("reduces pesosBalance and creates an asset position", () => {
      const orders = [
        makeOrder({ side: "CASH_IN", size: 10000, price: 1 }),
        makeOrder({ side: "BUY", size: 5, price: 100, instrumentId: 1 }),
      ];
      const result = service.calculate(orders);
      expect(result.pesosBalance).toBe(9500); // 10000 - 5*100
      expect(result.assets).toHaveLength(1);
      expect(result.assets[0].quantity).toBe(5);
      expect(result.assets[0].instrumentId).toBe(1);
    });

    it("accumulates multiple BUYs of the same instrument", () => {
      const orders = [
        makeOrder({ side: "CASH_IN", size: 50000, price: 1 }),
        makeOrder({ side: "BUY", size: 3, price: 100, instrumentId: 1 }),
        makeOrder({ side: "BUY", size: 2, price: 200, instrumentId: 1 }),
      ];
      const result = service.calculate(orders);
      const asset = result.assets.find((a) => a.instrumentId === 1)!;
      expect(asset.quantity).toBe(5);
      // investedCost = 3*100 + 2*200 = 700
      expect(asset.investedCost).toBe(700);
      expect(asset.currentPrice).toBe(200); // last buy price
    });
  });

  describe("SELL orders", () => {
    it("increases pesosBalance on SELL", () => {
      const orders = [
        makeOrder({ side: "CASH_IN", size: 10000, price: 1 }),
        makeOrder({ side: "BUY", size: 5, price: 100, instrumentId: 1 }),
        makeOrder({ side: "SELL", size: 2, price: 150, instrumentId: 1 }),
      ];
      const result = service.calculate(orders);
      // 10000 - 5*100 + 2*150 = 9800
      expect(result.pesosBalance).toBe(9800);
    });

    it("reduces asset quantity on partial sell", () => {
      const orders = [
        makeOrder({ side: "CASH_IN", size: 10000, price: 1 }),
        makeOrder({ side: "BUY", size: 5, price: 100, instrumentId: 1 }),
        makeOrder({ side: "SELL", size: 3, price: 100, instrumentId: 1 }),
      ];
      const result = service.calculate(orders);
      const asset = result.assets.find((a) => a.instrumentId === 1)!;
      expect(asset.quantity).toBe(2);
    });

    it("removes asset from list when all units are sold", () => {
      const orders = [
        makeOrder({ side: "CASH_IN", size: 10000, price: 1 }),
        makeOrder({ side: "BUY", size: 5, price: 100, instrumentId: 1 }),
        makeOrder({ side: "SELL", size: 5, price: 100, instrumentId: 1 }),
      ];
      const result = service.calculate(orders);
      expect(result.assets).toHaveLength(0);
    });
  });

  describe("unrealizedPnl and returnPct", () => {
    it("unrealizedPnl is zero right after a single BUY (cost == market value)", () => {
      const orders = [
        makeOrder({ side: "CASH_IN", size: 10000, price: 1 }),
        makeOrder({ side: "BUY", size: 10, price: 100, instrumentId: 2 }),
      ];
      const result = service.calculate(orders);
      const asset = result.assets.find((a) => a.instrumentId === 2)!;
      expect(asset.unrealizedPnl).toBe(0);
      // returnPct is 0 when no market data (no previousClose available)
      expect(asset.returnPct).toBe(0);
    });

    it("calculates positive unrealizedPnl across two BUY tranches at different prices", () => {
      // Buy 4 @ 100 then 4 @ 200 → avg = 150, currentPrice = 200
      const orders = [
        makeOrder({ side: "CASH_IN", size: 50000, price: 1 }),
        makeOrder({ side: "BUY", size: 4, price: 100, instrumentId: 3 }),
        makeOrder({ side: "BUY", size: 4, price: 200, instrumentId: 3 }),
      ];
      const result = service.calculate(orders);
      const asset = result.assets.find((a) => a.instrumentId === 3)!;
      // investedCost = 4*100 + 4*200 = 1200, marketValue = 8*200 = 1600
      expect(asset.investedCost).toBe(1200);
      expect(asset.marketValue).toBe(1600);
      expect(asset.unrealizedPnl).toBe(400);
      expect(asset.averageCost).toBe(150);
    });

    it("calculates returnPct as (close - previousClose) / previousClose when market data available", () => {
      const orders = [
        makeOrder({ side: "CASH_IN", size: 10000, price: 1 }),
        makeOrder({ side: "BUY", size: 10, price: 100, instrumentId: 1 }),
      ];
      // close=110, previousClose=100 → daily return = 10%
      const priceMap = new Map([[1, { close: 110, previousClose: 100 }]]);
      const result = service.calculate(orders, INSTRUMENT_MAP, priceMap);
      const asset = result.assets.find((a) => a.instrumentId === 1)!;
      expect(asset.returnPct).toBeCloseTo(10);
    });

    it("returns returnPct=0 when previousClose is missing", () => {
      const orders = [
        makeOrder({ side: "CASH_IN", size: 10000, price: 1 }),
        makeOrder({ side: "BUY", size: 10, price: 100, instrumentId: 1 }),
      ];
      const priceMap = new Map([[1, { close: 110 }]]);
      const result = service.calculate(orders, INSTRUMENT_MAP, priceMap);
      const asset = result.assets.find((a) => a.instrumentId === 1)!;
      expect(asset.returnPct).toBe(0);
    });
  });

  describe("multiple instruments", () => {
    it("tracks each instrument independently", () => {
      const orders = [
        makeOrder({ side: "CASH_IN", size: 20000, price: 1 }),
        makeOrder({ side: "BUY", size: 5, price: 100, instrumentId: 1 }),
        makeOrder({ side: "BUY", size: 3, price: 200, instrumentId: 2 }),
      ];
      const result = service.calculate(orders);
      expect(result.assets).toHaveLength(2);
      const a1 = result.assets.find((a) => a.instrumentId === 1)!;
      const a2 = result.assets.find((a) => a.instrumentId === 2)!;
      expect(a1.quantity).toBe(5);
      expect(a2.quantity).toBe(3);
    });
  });

  describe("priceMap override", () => {
    it("uses priceMap close price over last order price when available", () => {
      const orders = [
        makeOrder({ side: "CASH_IN", size: 10000, price: 1 }),
        makeOrder({ side: "BUY", size: 10, price: 100, instrumentId: 1 }),
      ];
      const priceMap = new Map([[1, { close: 150 }]]);
      const result = service.calculate(orders, INSTRUMENT_MAP, priceMap);
      const asset = result.assets.find((a) => a.instrumentId === 1)!;
      expect(asset.currentPrice).toBe(150);
      expect(asset.marketValue).toBe(1500); // 10 * 150
      expect(asset.unrealizedPnl).toBe(500); // 1500 - 1000
    });

    it("falls back to last order price when priceMap has no entry", () => {
      const orders = [
        makeOrder({ side: "CASH_IN", size: 10000, price: 1 }),
        makeOrder({ side: "BUY", size: 10, price: 100, instrumentId: 1 }),
      ];
      const result = service.calculate(orders, INSTRUMENT_MAP, new Map());
      const asset = result.assets.find((a) => a.instrumentId === 1)!;
      expect(asset.currentPrice).toBe(100); // falls back to order price
      expect(asset.marketValue).toBe(1000);
    });

    it("includes live prices in totalAccountValue", () => {
      const orders = [
        makeOrder({ side: "CASH_IN", size: 10000, price: 1 }),
        makeOrder({ side: "BUY", size: 10, price: 100, instrumentId: 1 }),
      ];
      // pesosBalance = 10000 - 1000 = 9000; marketValue with live price 200 = 2000
      const priceMap = new Map([[1, { close: 200 }]]);
      const result = service.calculate(orders, INSTRUMENT_MAP, priceMap);
      expect(result.pesosBalance).toBe(9000);
      expect(result.totalAccountValue).toBe(11000); // 9000 + 2000
    });
  });
});
