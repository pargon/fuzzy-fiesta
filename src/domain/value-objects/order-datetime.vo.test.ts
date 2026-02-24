import { OrderDatetime, InvalidOrderDatetimeError } from "./order-datetime.vo";

const SYSTEM_START = new Date("2020-01-01T00:00:00.000Z");
const VALID_DATE = new Date("2025-06-15T12:00:00.000Z");

describe("OrderDatetime", () => {
  describe("create — valid inputs", () => {
    it("accepts a date in the past", () => {
      const vo = OrderDatetime.create(VALID_DATE);
      expect(vo.value.toISOString()).toBe(VALID_DATE.toISOString());
    });

    it("accepts a date within the 60s future tolerance", () => {
      const nearFuture = new Date(Date.now() + 30_000);
      expect(() => OrderDatetime.create(nearFuture)).not.toThrow();
    });

    it("accepts the exact system start date", () => {
      expect(() => OrderDatetime.create(SYSTEM_START)).not.toThrow();
    });
  });

  describe("create — invalid inputs", () => {
    it("rejects a non-Date value (string)", () => {
      expect(() => OrderDatetime.create("2025-01-01" as unknown as Date)).toThrow(InvalidOrderDatetimeError);
    });

    it("rejects an invalid Date (NaN)", () => {
      expect(() => OrderDatetime.create(new Date("not-a-date"))).toThrow(InvalidOrderDatetimeError);
    });

    it("rejects a date more than 60s in the future", () => {
      const future = new Date(Date.now() + 120_000);
      expect(() => OrderDatetime.create(future)).toThrow(InvalidOrderDatetimeError);
    });

    it("rejects a date before system start (2020-01-01)", () => {
      const beforeStart = new Date("2019-12-31T23:59:59.999Z");
      expect(() => OrderDatetime.create(beforeStart)).toThrow(InvalidOrderDatetimeError);
    });
  });

  describe("defensive copy", () => {
    it("value getter returns a new Date instance each time", () => {
      const vo = OrderDatetime.create(VALID_DATE);
      expect(vo.value).not.toBe(vo.value);
    });

    it("mutating the returned Date does not affect the VO", () => {
      const vo = OrderDatetime.create(VALID_DATE);
      const d = vo.value;
      d.setFullYear(1990);
      expect(vo.value.getFullYear()).toBe(VALID_DATE.getFullYear());
    });
  });

  describe("reconstitute", () => {
    it("bypasses business validations (accepts old dates)", () => {
      const oldDate = new Date("2000-01-01T00:00:00.000Z");
      const vo = OrderDatetime.reconstitute(oldDate);
      expect(vo.value.toISOString()).toBe(oldDate.toISOString());
    });

    it("returns a defensive copy", () => {
      const vo = OrderDatetime.reconstitute(VALID_DATE);
      const d = vo.value;
      d.setFullYear(1990);
      expect(vo.value.getFullYear()).toBe(VALID_DATE.getFullYear());
    });
  });
});
