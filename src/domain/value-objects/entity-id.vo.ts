import { DomainError } from "../errors/domain.error";

export class InvalidEntityIdError extends DomainError {}

export class EntityId {
  private constructor(public readonly value: number) {
    Object.freeze(this);
  }

  static create(value: number): EntityId {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidEntityIdError("Entity id must be a positive integer.");
    }

    return new EntityId(value);
  }
}