import { DomainError } from "../errors/domain.error";

export class InvalidAccountNumberError extends DomainError {}

export class AccountNumber {
  private constructor(public readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): AccountNumber {
    const normalized = value.trim();
    if (normalized.length === 0) {
      throw new InvalidAccountNumberError("Account number cannot be empty.");
    }

    if (normalized.length > 20) {
      throw new InvalidAccountNumberError("Account number must be at most 20 characters.");
    }

    const accountNumberRegex = /^[a-zA-Z0-9_-]+$/;
    if (!accountNumberRegex.test(normalized)) {
      throw new InvalidAccountNumberError("Account number contains invalid characters.");
    }

    return new AccountNumber(normalized);
  }
}