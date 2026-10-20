/** Structured catalog validation issue — wire-compatible with `ApiValidationIssue`. */
export type ContentValidationIssue = {
  path: string
  message: string
  code: string
}
