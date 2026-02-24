import { OrderAvailabilityService, AvailabilityInput } from "./order-availability.service";
import { Instrument } from "../entities/instrument.entity";
import { OrderSide } from "../value-objects/order-side.vo";
import { OrderSize } from "../value-objects/order-size.vo";
import { Price } from "../value-objects/price.vo";
import { AssetPosition } from "./portfolio-from-filled-orders.service";

const stock = Instrument.create({ id: 1, ticker: "GGAL", name: "Grupo Galicia", type: "ACCIONES" });
const price100 = Price.create(100);

function makeInput(overrides: Partial<AvailabilityInput>): AvailabilityInput {
  return {
    side: OrderSide.create("BUY"),
    instrument: stock,
    size: OrderSize.create(3),
    price: price100,
    pesosBalance: 1000,
    assets: [],
    ...overrides,
  };
}

function makeAsset(instrumentId: number, quantity: number): AssetPosition {
  return { instrumentId, quantity };
}

describe("OrderAvailabilityService", () => {
  let service: OrderAvailabilityService;

  beforeEach(() => {
    service = new OrderAvailabilityService();
  });

  describe("BUY orders", () => {
    it("approves when pesosBalance >= orderAmount", () => {
      // 3 * 100 = 300 <= 1000
      const result = service.validate(makeInput({}));
      expect(result.success).toBe(true);
    });

    it("rejects when pesosBalance < orderAmount", () => {
      const result = service.validate(makeInput({ size: OrderSize.create(11) }));
      // 11 * 100 = 1100 > 1000
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toMatch(/insufficient funds/i);
      }
    });

    it("approves when orderAmount equals pesosBalance exactly", () => {
      // 10 * 100 = 1000 == 1000
      const result = service.validate(makeInput({ size: OrderSize.create(10) }));
      expect(result.success).toBe(true);
    });
  });

  describe("CASH_OUT orders", () => {
    it("rejects when pesosBalance < orderAmount", () => {
      const result = service.validate(
        makeInput({ side: OrderSide.create("CASH_OUT"), size: OrderSize.create(2000), price: Price.create(1) }),
      );
      expect(result.success).toBe(false);
    });

    it("approves when pesosBalance >= orderAmount", () => {
      const result = service.validate(
        makeInput({ side: OrderSide.create("CASH_OUT"), size: OrderSize.create(500), price: Price.create(1) }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe("SELL orders", () => {
    it("approves when holding >= sell size", () => {
      const result = service.validate(
        makeInput({
          side: OrderSide.create("SELL"),
          size: OrderSize.create(3),
          assets: [makeAsset(1, 5)],
        }),
      );
      expect(result.success).toBe(true);
    });

    it("approves when holding equals sell size exactly", () => {
      const result = service.validate(
        makeInput({
          side: OrderSide.create("SELL"),
          size: OrderSize.create(5),
          assets: [makeAsset(1, 5)],
        }),
      );
      expect(result.success).toBe(true);
    });

    it("rejects when holding < sell size", () => {
      const result = service.validate(
        makeInput({
          side: OrderSide.create("SELL"),
          size: OrderSize.create(10),
          assets: [makeAsset(1, 5)],
        }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toMatch(/insufficient shares/i);
      }
    });

    it("rejects when holding is zero (instrument not in portfolio)", () => {
      const result = service.validate(
        makeInput({
          side: OrderSide.create("SELL"),
          size: OrderSize.create(1),
          assets: [],
        }),
      );
      expect(result.success).toBe(false);
    });
  });

  describe("CASH_IN orders", () => {
    it("does not check balance for CASH_IN", () => {
      // CASH_IN is not BUY/CASH_OUT nor SELL — always succeeds
      const result = service.validate(
        makeInput({ side: OrderSide.create("CASH_IN"), pesosBalance: 0 }),
      );
      expect(result.success).toBe(true);
    });
  });
});
