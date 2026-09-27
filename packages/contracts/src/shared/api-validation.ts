import { isApiError } from './errors'

/** Stable issue code for invalid pagination cursors in hand-built API validation payloads. */
export const INVALID_CURSOR_ISSUE_CODE = 'invalid_cursor'

export type ApiValidationIssue = {
  path: string
  message: string
  code: string
}

export type ApiValidationDetails = {
  issues: ApiValidationIssue[]
}

export function isApiValidationDetails(value: unknown): value is ApiValidationDetails {
  if (typeof value !== 'object' || value === null) return false
  const issues = (value as ApiValidationDetails).issues
  return (
    Array.isArray(issues) &&
    issues.every(
      (issue) =>
        typeof issue === 'object' &&
        issue !== null &&
        typeof issue.path === 'string' &&
        typeof issue.message === 'string' &&
        typeof issue.code === 'string',
    )
  )
}

const API_VALIDATION_ISSUE_ERROR_CODES = new Set(['validation_error', 'bad_request'])

/** Returns structured field issues from API validation payloads, if present. */
export function getApiValidationIssues(err: unknown): ApiValidationIssue[] | undefined {
  if (!isApiError(err) || !API_VALIDATION_ISSUE_ERROR_CODES.has(err.code)) return undefined
  if (!isApiValidationDetails(err.details)) return undefined
  return err.details.issues
}
