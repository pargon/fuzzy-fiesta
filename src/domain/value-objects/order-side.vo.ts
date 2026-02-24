import { DomainError } from "../errors/domain.error";

export class InvalidOrderSideError extends DomainError {}

export const ORDER_SIDE_VALUES = ["BUY", "SELL", "CASH_IN", "CASH_OUT"] as const;

export type OrderSideValue = (typeof ORDER_SIDE_VALUES)[number];

export class OrderSide {
  private constructor(public readonly value: OrderSideValue) {
    Object.freeze(this);
  }

  static create(value: string): OrderSide {
    const normalized = value.trim().toUpperCase();
    if (normalized.length === 0) {
      throw new InvalidOrderSideError("Order side cannot be empty.");
    }

    if (!ORDER_SIDE_VALUES.includes(normalized as OrderSideValue)) {
      throw new InvalidOrderSideError(`Order side must be one of: ${ORDER_SIDE_VALUES.join(", ")}.`);
    }

    return new OrderSide(normalized as OrderSideValue);
  }

  static fromValidated(value: OrderSideValue): OrderSide {
    return new OrderSide(value);
  }

  static fromLegacy(value: string | null | undefined): OrderSide {
    if (!value || value.trim().length === 0) {
      throw new InvalidOrderSideError("Order side is missing in legacy record.");
    }
    const normalized = value.trim().toUpperCase();
    if (!ORDER_SIDE_VALUES.includes(normalized as OrderSideValue)) {
      throw new InvalidOrderSideError(`Invalid order side in legacy record: ${value}.`);
    }
    return new OrderSide(normalized as OrderSideValue);
  }

  isCashTransfer(): boolean {
    return this.value === "CASH_IN" || this.value === "CASH_OUT";
  }

  isBuy(): boolean { return this.value === "BUY"; }
  isSell(): boolean { return this.value === "SELL"; }
  isCashOut(): boolean { return this.value === "CASH_OUT"; }
}