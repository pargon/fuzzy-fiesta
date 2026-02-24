import { DomainError } from "../errors/domain.error";

export class InvalidOrderDatetimeError extends DomainError { }

const MAX_FUTURE_TOLERANCE_MS = 60_000;
const SYSTEM_START_DATE = new Date("2020-01-01T00:00:00.000Z");

export class OrderDatetime {
  private readonly _value: Date;

  private constructor(value: Date) {
    this._value = value;
    Object.freeze(this);
  }

  get value(): Date {
    return new Date(this._value.getTime());
  }

  static create(value: Date): OrderDatetime {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new InvalidOrderDatetimeError("Order datetime must be a valid Date.");
    }
    if (value.getTime() > Date.now() + MAX_FUTURE_TOLERANCE_MS) {
      throw new InvalidOrderDatetimeError("Order datetime cannot be in the future.");
    }
    if (value.getTime() < SYSTEM_START_DATE.getTime()) {
      throw new InvalidOrderDatetimeError(
        `Order datetime cannot be before system start date (${SYSTEM_START_DATE.toISOString()}).`,
      );
    }
    return new OrderDatetime(new Date(value.getTime()));
  }

  static reconstitute(value: Date | null | undefined): OrderDatetime {
    if (!value || !(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new InvalidOrderDatetimeError("Persistent order datetime is missing or invalid.");
    }
    return new OrderDatetime(new Date(value.getTime()));
  }
}