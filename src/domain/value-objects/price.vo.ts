import { DomainError } from "../errors/domain.error";

export class InvalidPriceError extends DomainError { }

export class Price {
  private constructor(public readonly value: number) {
    Object.freeze(this);
  }

  static create(value: number): Price {
    if (value < 0) {
      throw new InvalidPriceError("Price must be a positive number.");
    }
    return new Price(value);
  }


  static fromPersistence(value: number | null | undefined, orderType?: string): Price {
    if (value === null || value === undefined || value <= 0) {
      if (orderType === "LIMIT") {
        throw new InvalidPriceError(`LIMIT order has no valid price.`);
      }
      return new Price(0); // MARKET: se ejecuta a precio de mercado, 0 como placeholder
    }
    return new Price(value);
  }
}