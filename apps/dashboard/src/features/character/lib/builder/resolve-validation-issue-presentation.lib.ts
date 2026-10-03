import { BUILDER_STEPS, formatFieldMessage } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

export type ValidationIssuePresentation = {
  message: string
  contextLabel?: string
  technicalDetails?: string
}

export function shouldInlineValidationTechnicalDetails(): boolean {
  return import.meta.env.DEV
}

function formatTechnicalDetails(path: string | undefined, code: string): string | undefined {
  if (path && code) return joinInlineMetadata([path, code])
  if (path) return path
  if (code) return code
  return undefined
}

export function resolveValidationIssuePresentation(
  issue: CharacterBuildValidationIssue,
): ValidationIssuePresentation {
  const step = issue.stepId ? BUILDER_STEPS.find((entry) => entry.id === issue.stepId) : undefined

  return {
    message: formatFieldMessage(issue.message),
    contextLabel: step?.label,
    technicalDetails: formatTechnicalDetails(issue.path, issue.code),
  }
}
