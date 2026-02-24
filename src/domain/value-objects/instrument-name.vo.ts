import { DomainError } from "../errors/domain.error";

export class InvalidInstrumentNameError extends DomainError {}

export class InstrumentName {
  private constructor(public readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): InstrumentName {
    const normalized = value.trim();
    if (normalized.length === 0) {
      throw new InvalidInstrumentNameError("Instrument name cannot be empty.");
    }

    if (normalized.length > 255) {
      throw new InvalidInstrumentNameError("Instrument name must be at most 255 characters.");
    }

    return new InstrumentName(normalized);
  }
}