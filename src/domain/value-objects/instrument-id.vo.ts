import { DomainError } from "../errors/domain.error";

export class InvalidInstrumentIdError extends DomainError {}

export class InstrumentId {
  private constructor(public readonly value: number) {
    Object.freeze(this);
  }

  static create(value: number): InstrumentId {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidInstrumentIdError("Instrument id must be a positive integer.");
    }

    return new InstrumentId(value);
  }
}
