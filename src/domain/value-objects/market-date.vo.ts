import { DomainError } from "../errors/domain.error";

export class InvalidMarketDateError extends DomainError {}

export class MarketDate {
  private constructor(public readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): MarketDate {
    const normalized = value.trim();
    if (normalized.length === 0) {
      throw new InvalidMarketDateError("Date cannot be empty.");
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(normalized)) {
      throw new InvalidMarketDateError("Date must have YYYY-MM-DD format.");
    }

    const parsedDate = new Date(`${normalized}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new InvalidMarketDateError("Date is invalid.");
    }

    return new MarketDate(normalized);
  }
}