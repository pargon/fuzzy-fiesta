import { DomainError } from "../errors/domain.error";

export class InvalidInstrumentTypeError extends DomainError {}

export class InstrumentType {
  private constructor(public readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): InstrumentType {
    const normalized = value.trim().toUpperCase();
    if (normalized.length === 0) {
      throw new InvalidInstrumentTypeError("Instrument type cannot be empty.");
    }

    if (normalized.length > 10) {
      throw new InvalidInstrumentTypeError("Instrument type must be at most 10 characters.");
    }

    return new InstrumentType(normalized);
  }

  isCurrency(): boolean { return this.value === "MONEDA"; }
}