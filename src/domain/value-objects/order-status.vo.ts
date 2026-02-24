import { DomainError } from "../errors/domain.error";

export class InvalidOrderStatusError extends DomainError { }

export const ORDER_STATUS_VALUES = ["NEW", "FILLED", "REJECTED", "CANCELLED"] as const;

export type OrderStatusValue = (typeof ORDER_STATUS_VALUES)[number];

export class OrderStatus {
  private constructor(public readonly value: OrderStatusValue) {
    Object.freeze(this);
  }

  static create(value: string): OrderStatus {
    const normalized = value.trim().toUpperCase();
    if (normalized.length === 0) {
      throw new InvalidOrderStatusError("Order status cannot be empty.");
    }

    if (!ORDER_STATUS_VALUES.includes(normalized as OrderStatusValue)) {
      throw new InvalidOrderStatusError(`Order status must be one of: ${ORDER_STATUS_VALUES.join(", ")}.`);
    }

    return new OrderStatus(normalized as OrderStatusValue);
  }

  static fromValidated(value: OrderStatusValue): OrderStatus {
    return new OrderStatus(value);
  }

  static fromLegacy(value: string | null | undefined): OrderStatus {
    if (!value || value.trim().length === 0) {
      throw new InvalidOrderStatusError("Order status is missing in legacy record.");
    }
    const normalized = value.trim().toUpperCase();
    if (!ORDER_STATUS_VALUES.includes(normalized as OrderStatusValue)) {
      throw new InvalidOrderStatusError(`Invalid order status in legacy record: ${value}.`);
    }
    return new OrderStatus(normalized as OrderStatusValue);
  }

  isNew(): boolean { return this.value === "NEW"; }
  static new(): OrderStatus { return new OrderStatus("NEW"); }
  static filled(): OrderStatus { return new OrderStatus("FILLED"); }
  static rejected(): OrderStatus { return new OrderStatus("REJECTED"); }
  static cancelled(): OrderStatus { return new OrderStatus("CANCELLED"); }
}

export const ORDER_STATUS = {
  NEW: "NEW",
  FILLED: "FILLED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const satisfies Record<string, OrderStatusValue>;