import { OrderSizeService, OrderSizingError } from "./order-size.service";
import { OrderSide } from "../value-objects/order-side.vo";
import { Price } from "../value-objects/price.vo";

const BUY = OrderSide.create("BUY");
const SELL = OrderSide.create("SELL");
const CASH_IN = OrderSide.create("CASH_IN");
const CASH_OUT = OrderSide.create("CASH_OUT");
const price10 = Price.create(10);

describe("OrderSizeService", () => {
  let service: OrderSizeService;

  beforeEach(() => {
    service = new OrderSizeService();
  });

  describe("BUY / SELL — explicit size", () => {
    it("returns the exact size when size is provided (BUY)", () => {
      const result = service.resolveSize({ side: BUY, price: price10, size: 5 });
      expect(result.value).toBe(5);
    });

    it("returns the exact size when size is provided (SELL)", () => {
      const result = service.resolveSize({ side: SELL, price: price10, size: 3 });
      expect(result.value).toBe(3);
    });
  });

  describe("BUY / SELL — amount with floor division", () => {
    it("calculates floor(amount / price) for BUY", () => {
      const result = service.resolveSize({ side: BUY, price: price10, amount: 105 });
      expect(result.value).toBe(10);
    });

    it("calculates floor(amount / price) for SELL", () => {
      const result = service.resolveSize({ side: SELL, price: price10, amount: 99 });
      expect(result.value).toBe(9);
    });

    it("throws OrderSizingError when amount is too small to buy a single unit", () => {
      expect(() =>
        service.resolveSize({ side: BUY, price: price10, amount: 5 }),
      ).toThrow(OrderSizingError);
    });

    it("throws OrderSizingError with descriptive message when amount < price", () => {
      expect(() =>
        service.resolveSize({ side: BUY, price: price10, amount: 5 }),
      ).toThrow(/insufficient amount/i);
    });
  });

  describe("CASH_IN / CASH_OUT — amount equals size directly", () => {
    it("returns amount as size for CASH_IN (price is always 1)", () => {
      const result = service.resolveSize({ side: CASH_IN, price: Price.create(1), amount: 5000 });
      expect(result.value).toBe(5000);
    });

    it("returns amount as size for CASH_OUT", () => {
      const result = service.resolveSize({ side: CASH_OUT, price: Price.create(1), amount: 1000 });
      expect(result.value).toBe(1000);
    });

    it("throws OrderSizingError when amount is missing for CASH_IN", () => {
      expect(() =>
        service.resolveSize({ side: CASH_IN, price: Price.create(1) }),
      ).toThrow(OrderSizingError);
    });

    it("throws OrderSizingError when amount is missing for CASH_OUT", () => {
      expect(() =>
        service.resolveSize({ side: CASH_OUT, price: Price.create(1) }),
      ).toThrow(OrderSizingError);
    });
  });
});
