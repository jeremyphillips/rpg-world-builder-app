import type { ArrayPatternConfig } from '../field-config'
import type { FormIssue, FormIssueSeverity } from './form-issue.types'

export type ClassifyFormIssueOptions = {
  arrayPattern?: ArrayPatternConfig
  fieldOrder?: readonly string[]
}

function resolveLevelRangeKeys(arrayPattern: ArrayPatternConfig | undefined): {
  min: string
  max: string
} {
  if (arrayPattern?.kind !== 'levelRange') {
    return { min: 'minLevel', max: 'maxLevel' }
  }

  const levelKeys = arrayPattern.levelKeys as { min?: string; max?: string } | undefined
  return {
    min: levelKeys?.min ?? 'minLevel',
    max: levelKeys?.max ?? 'maxLevel',
  }
}

function defaultSeverity(issue: FormIssue, arrayPattern?: ArrayPatternConfig): FormIssueSeverity {
  if (!issue.relativePath) return 'row'

  const { min, max } = resolveLevelRangeKeys(arrayPattern)
  const leaf = issue.relativePath.split('.').pop() ?? issue.relativePath

  if (arrayPattern?.kind === 'levelRange' && (leaf === min || leaf === max)) {
    return 'crossRow'
  }

  return 'field'
}

/** Apply pattern hook or default heuristics to issue severity. */
export function classifyFormIssue(
  issue: FormIssue,
  options: ClassifyFormIssueOptions = {},
): FormIssue {
  const severity =
    options.arrayPattern?.classifyIssueSeverity?.(issue) ??
    defaultSeverity(issue, options.arrayPattern)

  return { ...issue, severity }
}

export function classifyFormIssues(
  issues: FormIssue[],
  options: ClassifyFormIssueOptions = {},
): FormIssue[] {
  return issues.map((issue) => classifyFormIssue(issue, options))
}
