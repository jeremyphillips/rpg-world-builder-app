export const CLI_ERROR_CODES = [
  'VALIDATION_ERROR',
  'API_ERROR',
  'NETWORK_ERROR',
  'NOT_FOUND',
  'AMBIGUOUS_EPIC',
] as const

export type CliErrorCode = (typeof CLI_ERROR_CODES)[number]

export class CliError extends Error {
  readonly code: CliErrorCode
  readonly details?: unknown

  constructor(code: CliErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = 'CliError'
    this.code = code
    this.details = details
  }
}

export function isCliError(error: unknown): error is CliError {
  return error instanceof CliError
}
