import type { ArrayPatternConfig } from '../field-config'
import type { FormIssue, FormIssueScope, FormIssueSeverity } from './form-issue.types'

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

function isLeafRelativePath(relativePath: string): boolean {
  const leaf = relativePath.split('.').pop() ?? relativePath
  return leaf.length > 0 && !/^\d+$/.test(leaf)
}

function defaultScope(issue: FormIssue): FormIssueScope {
  if (!issue.arrayPath) return 'form'
  if (issue.path === issue.arrayPath) return 'array'
  if (!issue.relativePath) return 'item'
  if (isLeafRelativePath(issue.relativePath)) return 'field'
  return 'item'
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

/** Apply pattern hook or default heuristics to issue severity and scope. */
export function classifyFormIssue(
  issue: FormIssue,
  options: ClassifyFormIssueOptions = {},
): FormIssue {
  const severity =
    options.arrayPattern?.classifyIssueSeverity?.(issue) ??
    defaultSeverity(issue, options.arrayPattern)

  const scope = options.arrayPattern?.classifyIssueScope?.(issue) ?? defaultScope(issue)

  return { ...issue, severity, scope }
}

export function classifyFormIssues(
  issues: FormIssue[],
  options: ClassifyFormIssueOptions = {},
): FormIssue[] {
  return issues.map((issue) => classifyFormIssue(issue, options))
}
