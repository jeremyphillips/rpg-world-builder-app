export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

/**
 * Extract a user-facing message from a thrown value: the `ApiError` message when
 * available, otherwise the provided fallback. Keeps error handling consistent
 * across API clients and form components.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback
}
