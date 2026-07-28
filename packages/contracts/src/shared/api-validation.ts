import { isApiError } from './errors'

export type ApiValidationIssue = {
  path: string
  message: string
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
        typeof issue.message === 'string',
    )
  )
}

/** Returns structured field issues from a `validation_error` ApiError, if present. */
export function getApiValidationIssues(err: unknown): ApiValidationIssue[] | undefined {
  if (!isApiError(err) || err.code !== 'validation_error') return undefined
  if (!isApiValidationDetails(err.details)) return undefined
  return err.details.issues
}
