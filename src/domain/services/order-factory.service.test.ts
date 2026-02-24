import { OrderFactoryService } from "./order-factory.service";
import { IncompatibleInstrumentError } from "../errors/incompatible-instrument.error";
import { Instrument } from "../entities/instrument.entity";
import { OrderDatetime } from "../value-objects/order-datetime.vo";
import { OrderSide } from "../value-objects/order-side.vo";
import { OrderSize } from "../value-objects/order-size.vo";
import { OrderType } from "../value-objects/order-type.vo";
import { Price } from "../value-objects/price.vo";
import { UserId } from "../value-objects/user-id.vo";

const stock = Instrument.create({ id: 1, ticker: "GGAL", name: "Grupo Galicia", type: "ACCIONES" });
const currency = Instrument.create({ id: 2, ticker: "ARS", name: "Pesos", type: "MONEDA" });

const validDatetime = OrderDatetime.reconstitute(new Date("2025-06-01T10:00:00.000Z"));

function makeInput(overrides: {
  instrument?: Instrument;
  side?: OrderSide;
  type?: OrderType;
}) {
  return {
    userId: UserId.create(1),
    instrument: overrides.instrument ?? stock,
    side: overrides.side ?? OrderSide.create("BUY"),
    type: overrides.type ?? OrderType.market(),
    size: OrderSize.create(5),
    price: Price.create(100),
    datetime: validDatetime,
  };
}

describe("OrderFactoryService", () => {
  let factory: OrderFactoryService;

  beforeEach(() => {
    factory = new OrderFactoryService();
  });

  describe("validateInstrumentCompatibility", () => {
    it("allows BUY of a stock", () => {
      expect(() =>
        factory.validateInstrumentCompatibility(stock, OrderSide.create("BUY"), OrderType.market()),
      ).not.toThrow();
    });

    it("allows SELL of a stock", () => {
      expect(() =>
        factory.validateInstrumentCompatibility(stock, OrderSide.create("SELL"), OrderType.market()),
      ).not.toThrow();
    });

    it("allows CASH_IN with MONEDA instrument", () => {
      expect(() =>
        factory.validateInstrumentCompatibility(currency, OrderSide.create("CASH_IN"), OrderType.market()),
      ).not.toThrow();
    });

    it("allows CASH_OUT with MONEDA instrument", () => {
      expect(() =>
        factory.validateInstrumentCompatibility(currency, OrderSide.create("CASH_OUT"), OrderType.market()),
      ).not.toThrow();
    });

    it("rejects BUY of a MONEDA instrument", () => {
      expect(() =>
        factory.validateInstrumentCompatibility(currency, OrderSide.create("BUY"), OrderType.market()),
      ).toThrow(IncompatibleInstrumentError);
    });

    it("rejects SELL of a MONEDA instrument", () => {
      expect(() =>
        factory.validateInstrumentCompatibility(currency, OrderSide.create("SELL"), OrderType.market()),
      ).toThrow(IncompatibleInstrumentError);
    });

    it("rejects CASH_IN of a non-MONEDA instrument", () => {
      expect(() =>
        factory.validateInstrumentCompatibility(stock, OrderSide.create("CASH_IN"), OrderType.market()),
      ).toThrow(IncompatibleInstrumentError);
    });

    it("rejects CASH_OUT of a non-MONEDA instrument", () => {
      expect(() =>
        factory.validateInstrumentCompatibility(stock, OrderSide.create("CASH_OUT"), OrderType.market()),
      ).toThrow(IncompatibleInstrumentError);
    });

    it("rejects CASH_IN with LIMIT type", () => {
      expect(() =>
        factory.validateInstrumentCompatibility(currency, OrderSide.create("CASH_IN"), OrderType.limit()),
      ).toThrow(IncompatibleInstrumentError);
    });
  });

  describe("createRejected", () => {
    it("sets status to REJECTED", () => {
      const order = factory.createRejected(makeInput({}));
      expect(order.status.value).toBe("REJECTED");
    });

    it("preserves all other fields", () => {
      const input = makeInput({ side: OrderSide.create("SELL"), type: OrderType.market() });
      const order = factory.createRejected(input);
      expect(order.side.value).toBe("SELL");
      expect(order.size.value).toBe(5);
      expect(order.price.value).toBe(100);
    });
  });

  describe("createAccepted", () => {
    it("sets status to FILLED for MARKET orders", () => {
      const order = factory.createAccepted(makeInput({ type: OrderType.market() }));
      expect(order.status.value).toBe("FILLED");
    });

    it("sets status to NEW for LIMIT orders", () => {
      const order = factory.createAccepted(makeInput({ type: OrderType.limit() }));
      expect(order.status.value).toBe("NEW");
    });
  });
});
