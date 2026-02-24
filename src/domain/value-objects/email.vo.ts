import { DomainError } from "../errors/domain.error";

export class InvalidEmailError extends DomainError {}

export class Email {
  private constructor(public readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();
    if (normalized.length === 0) {
      throw new InvalidEmailError("Email cannot be empty.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      throw new InvalidEmailError("Email format is invalid.");
    }

    if (normalized.length > 255) {
      throw new InvalidEmailError("Email must be at most 255 characters.");
    }

    return new Email(normalized);
  }
}