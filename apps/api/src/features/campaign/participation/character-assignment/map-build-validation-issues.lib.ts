import type { CharacterBuildValidationIssue } from '@rpg/contracts'
import type { ZodError } from 'zod'

export function zodIssuesToBuildValidationIssues(error: ZodError): CharacterBuildValidationIssue[] {
  return error.issues.map((issue) => ({
    code: 'invalid_field',
    message: issue.message,
    path: issue.path.length > 0 ? issue.path.join('.') : undefined,
  }))
}
