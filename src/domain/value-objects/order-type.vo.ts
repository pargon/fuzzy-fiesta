import { DomainError } from "../errors/domain.error";

export class InvalidOrderTypeError extends DomainError {}

export const ORDER_TYPE_VALUES = ["MARKET", "LIMIT"] as const;

export type OrderTypeValue = (typeof ORDER_TYPE_VALUES)[number];

export class OrderType {
  private constructor(public readonly value: OrderTypeValue) {
    Object.freeze(this);
  }

  static create(value: string): OrderType {
    if (value.trim().length === 0) {
      throw new InvalidOrderTypeError("Order type is required for new orders.");
    }
    return OrderType.fromValue(value);
  }

  static fromLegacy(value: string | null | undefined): OrderType {
    if (!value || value.trim().length === 0) {
      return OrderType.limit(); 
    }
    return OrderType.fromValue(value);
  }

  private static fromValue(value: string): OrderType {
    const normalized = value.trim().toUpperCase();
    if (!ORDER_TYPE_VALUES.includes(normalized as OrderTypeValue)) {
      throw new InvalidOrderTypeError(`Invalid order type: ${value}`);
    }
    return new OrderType(normalized as OrderTypeValue);
  }

  static market(): OrderType { return new OrderType("MARKET"); }
  static limit(): OrderType { return new OrderType("LIMIT"); }
  static fromValidated(value: OrderTypeValue): OrderType { return new OrderType(value); }

  isLimit(): boolean { return this.value === "LIMIT"; }
  isMarket(): boolean { return this.value === "MARKET"; }
}