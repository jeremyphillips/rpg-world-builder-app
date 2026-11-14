import type { ArrayConfig } from '../../field-config'
import type { FormIssue } from '../../errors/form-issue.types'
import { countInvalidArrayItems, countIssuesForArrayPath } from '../../errors'

export function resolveArrayAppendAvailability(options: {
  config: ArrayConfig
  fieldsLength: number
  max: number | undefined
  watchedItems: unknown[] | undefined
  getItemValues: (index: number) => Record<string, unknown>
}): {
  addEnabled: boolean
  addDisabledReason: string | undefined
} {
  const { config, fieldsLength, max, watchedItems, getItemValues } = options
  const underMax = max === undefined || fieldsLength < max
  const canAppend = config.resolveCanAppend?.(
    watchedItems ?? Array.from({ length: fieldsLength }, (_, index) => getItemValues(index)),
  ) ?? { enabled: true }
  const addEnabled = underMax && canAppend.enabled
  const addDisabledReason = !canAppend.enabled
    ? canAppend.reason
    : !underMax
      ? `Add up to ${max} items.`
      : undefined

  return { addEnabled, addDisabledReason }
}

export function resolveArrayValidationCounts(options: {
  fullName: string
  showValidationCounts: boolean
  issues: readonly FormIssue[]
}): {
  containerIssue: FormIssue | undefined
  hasContainerIssue: boolean
  invalidRowCount: number
  arrayIssueCount: number
} {
  const { fullName, showValidationCounts, issues } = options
  const containerIssue = issues.find((issue) => issue.path === fullName)
  return {
    containerIssue,
    hasContainerIssue: containerIssue !== undefined,
    invalidRowCount: showValidationCounts ? countInvalidArrayItems(issues, fullName) : 0,
    arrayIssueCount: showValidationCounts ? countIssuesForArrayPath(issues, fullName) : 0,
  }
}
