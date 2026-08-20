export type NestedCreateHandoffFailureStatus = 'not-found' | 'ineligible' | 'unsupported'

export class NestedCreateHandoffError extends Error {
  readonly status: NestedCreateHandoffFailureStatus

  constructor(status: NestedCreateHandoffFailureStatus) {
    super(status)
    this.name = 'NestedCreateHandoffError'
    this.status = status
  }
}

export const NESTED_CREATE_HANDOFF_NOT_FOUND_MESSAGE =
  'Created, but the new entry is not visible yet. Try refreshing or select it manually.' as const

export const NESTED_CREATE_HANDOFF_INELIGIBLE_MESSAGE =
  'Created, but it cannot be linked in this slot. Select it manually or change the relationship kind.' as const

export const NESTED_CREATE_HANDOFF_UNSUPPORTED_MESSAGE =
  'Created, but automatic selection is not supported for this content type.' as const

export const NESTED_CREATE_HANDOFF_UNEXPECTED_ERROR_MESSAGE =
  'Created, but selection could not be completed. Try selecting it manually.' as const

const FAILURE_MESSAGES: Record<NestedCreateHandoffFailureStatus, string> = {
  'not-found': NESTED_CREATE_HANDOFF_NOT_FOUND_MESSAGE,
  ineligible: NESTED_CREATE_HANDOFF_INELIGIBLE_MESSAGE,
  unsupported: NESTED_CREATE_HANDOFF_UNSUPPORTED_MESSAGE,
}

export function formatNestedCreateHandoffFailure(
  error: unknown,
  fallbackMessage = NESTED_CREATE_HANDOFF_UNEXPECTED_ERROR_MESSAGE,
): string {
  if (error instanceof NestedCreateHandoffError) {
    return FAILURE_MESSAGES[error.status]
  }
  return fallbackMessage
}
