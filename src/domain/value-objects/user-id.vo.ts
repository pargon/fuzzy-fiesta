import { DomainError } from "../errors/domain.error";

export class InvalidUserIdError extends DomainError {}

export class UserId {
  private constructor(public readonly value: number) {
    Object.freeze(this);
  }

  static create(value: number): UserId {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidUserIdError("User id must be a positive integer.");
    }

    return new UserId(value);
  }
}
