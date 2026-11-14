import { isFieldPathEligibleForPresentation } from '../../errors/resolve-field-error-presentation.lib'
import { resolveFieldOrderIndex } from '../../errors/resolve-field-order'
import type { FormIssue } from '../../errors/form-issue.types'

function resolveItemRelativePath(
  issue: Pick<FormIssue, 'path' | 'presentationPath' | 'relativePath'>,
  itemPrefix: string,
): string | undefined {
  if (issue.relativePath) return issue.relativePath
  const presentationPath = issue.presentationPath ?? issue.path
  if (presentationPath === itemPrefix) return undefined
  if (!presentationPath.startsWith(`${itemPrefix}.`)) return undefined
  return presentationPath.slice(itemPrefix.length + 1)
}

/** Whether a field issue maps to a registered, presentation-eligible control on this row. */
export function fieldIssueHasRenderableControl(
  issue: Pick<FormIssue, 'path' | 'presentationPath' | 'relativePath'>,
  options: {
    itemPrefix: string
    fieldOrder: readonly string[]
    inactivePaths: ReadonlySet<string>
  },
): boolean {
  const presentationPath = issue.presentationPath ?? issue.path
  if (!isFieldPathEligibleForPresentation(presentationPath, options.inactivePaths)) {
    return false
  }

  const relativePath = resolveItemRelativePath(issue, options.itemPrefix)
  if (!relativePath) return false

  return resolveFieldOrderIndex(relativePath, options.fieldOrder) !== Number.MAX_SAFE_INTEGER
}

export function fieldIssuesNeedJoinedSummary(
  fieldIssues: readonly FormIssue[],
  options: {
    itemPrefix: string
    fieldOrder: readonly string[]
    inactivePaths: ReadonlySet<string>
    hasVisibleBodyFields: boolean
    collapsed: boolean
  },
): boolean {
  if (fieldIssues.length === 0) return false
  if (!options.hasVisibleBodyFields) return true
  if (options.collapsed) return true
  return fieldIssues.some((issue) => !fieldIssueHasRenderableControl(issue, options))
}
