import type { ArrayErrorFocusContext, ArrayPatternConfig } from '../field-config'
import type { FormIssue } from './form-issue.types'

/** Matches {@link buildFieldControlId} in form-conditional.client.tsx. */
export function buildFieldControlId(
  idPrefix: string,
  namePrefix: string | undefined,
  fieldName: string,
): string {
  const fullName = namePrefix ? `${namePrefix}.${fieldName}` : fieldName
  return `${idPrefix}-${fullName.replaceAll('.', '-')}`
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

function defaultLevelRangeFocusTarget(
  issue: FormIssue,
  levelKeys: { min: string; max: string },
): string | undefined {
  const relative = issue.relativePath ?? ''
  const leaf = relative.split('.').pop() ?? relative
  const message = issue.message.toLowerCase()

  if (leaf === levelKeys.max || message.includes('cover levels') || message.includes('end at')) {
    return levelKeys.max
  }

  if (
    leaf === levelKeys.min ||
    message.includes('overlap') ||
    message.includes('contiguous') ||
    message.includes('missing') ||
    message.includes('start at')
  ) {
    return levelKeys.min
  }

  return undefined
}

/** Resolve a relative field name suitable for focusing an issue's control. */
export function resolveIssueFocusFieldName(
  issue: FormIssue,
  arrayPattern?: ArrayPatternConfig,
  itemIndex = issue.itemIndex ?? 0,
): string | undefined {
  if (arrayPattern?.getErrorFocusTarget) {
    const ctx: ArrayErrorFocusContext = {
      issue,
      itemIndex,
      levelKeys: resolveLevelRangeKeys(arrayPattern),
    }
    const target = arrayPattern.getErrorFocusTarget(ctx)
    if (target) return target
  }

  if (arrayPattern?.kind === 'levelRange') {
    const levelKeys = resolveLevelRangeKeys(arrayPattern)
    const mapped = defaultLevelRangeFocusTarget(issue, levelKeys)
    if (mapped) return mapped
  }

  if (issue.severity === 'field' && issue.relativePath) {
    return issue.relativePath
  }

  return undefined
}

/** Resolve the DOM control id for an issue, when focus is possible. */
export function resolveIssueFocusControlId(
  issue: FormIssue,
  idPrefix: string,
  arrayPattern?: ArrayPatternConfig,
): string | undefined {
  const fieldName = resolveIssueFocusFieldName(issue, arrayPattern)
  if (!fieldName || issue.itemPrefix === undefined) return undefined

  return buildFieldControlId(idPrefix, issue.itemPrefix, fieldName)
}
