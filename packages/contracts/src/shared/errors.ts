export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/** Structural check — avoids `instanceof` failures across duplicate module instances in Vite. */
export function isApiError(err: unknown): err is ApiError {
  if (typeof err !== 'object' || err === null) return false

  const candidate = err as Partial<ApiError>
  return (
    candidate.name === 'ApiError' &&
    typeof candidate.status === 'number' &&
    typeof candidate.code === 'string' &&
    typeof candidate.message === 'string'
  )
}

/**
 * Extract a user-facing message from a thrown value: the `ApiError` message when
 * available, otherwise the provided fallback. Keeps error handling consistent
 * across API clients and form components.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  return isApiError(err) ? err.message : fallback
}
