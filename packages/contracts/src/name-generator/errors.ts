// ---------------------------------------------------------------------------
// Name generator error codes — stable identifiers for loader and generation.
// ---------------------------------------------------------------------------

export const NAME_GENERATOR_ERROR_CODES = [
  'unknown-collection',
  'unknown-convention',
  'invalid-asset',
  'unsupported-version',
  'unknown-structure',
  'missing-collection',
  'empty-pool',
  'missing-required-part',
  'generation-exhausted',
] as const

export type NameGeneratorErrorCode = (typeof NAME_GENERATOR_ERROR_CODES)[number]

export class NameGeneratorError extends Error {
  readonly code: NameGeneratorErrorCode

  constructor(code: NameGeneratorErrorCode, message: string) {
    super(message)
    this.name = 'NameGeneratorError'
    this.code = code
  }
}

export function isNameGeneratorErrorCode(code: string): code is NameGeneratorErrorCode {
  return (NAME_GENERATOR_ERROR_CODES as readonly string[]).includes(code)
}

export function isNameGeneratorError(error: unknown): error is NameGeneratorError {
  return error instanceof NameGeneratorError
}
