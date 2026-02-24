import { DomainError } from "../errors/domain.error";

export class InvalidTickerError extends DomainError {}

export class Ticker {
  private constructor(public readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): Ticker {
    const normalized = value.trim().toUpperCase();
    if (normalized.length === 0) {
      throw new InvalidTickerError("Ticker cannot be empty.");
    }

    if (normalized.length > 10) {
      throw new InvalidTickerError("Ticker must be at most 10 characters.");
    }

    const tickerRegex = /^[A-Z0-9._-]+$/;
    if (!tickerRegex.test(normalized)) {
      throw new InvalidTickerError("Ticker contains invalid characters.");
    }

    return new Ticker(normalized);
  }
}