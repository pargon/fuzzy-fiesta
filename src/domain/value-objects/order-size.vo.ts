import { DomainError } from "../errors/domain.error";

export class InvalidOrderSizeError extends DomainError { }

export class OrderSize {
  private constructor(public readonly value: number) {
    Object.freeze(this);
  }

  static create(value: number): OrderSize {
    if (!Number.isInteger(value)) {
      throw new InvalidOrderSizeError("Order size must be an integer.");
    }
    if (value <= 0) {
      throw new InvalidOrderSizeError("Order size must be greater than zero.");
    }
    return new OrderSize(value);
  }
}