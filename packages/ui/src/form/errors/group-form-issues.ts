import type { ArraySectionMeta } from './resolve-field-order'
import { resolveFieldOrderIndex } from './resolve-field-order'
import type { ArrayItemIssueGroup, FormIssue } from './form-issue.types'
import { FORM_ISSUE_SEVERITY_ORDER } from './form-issue.types'

function compareIssues(left: FormIssue, right: FormIssue, fieldOrder: readonly string[]): number {
  const severityDelta =
    FORM_ISSUE_SEVERITY_ORDER[left.severity] - FORM_ISSUE_SEVERITY_ORDER[right.severity]
  if (severityDelta !== 0) return severityDelta

  const leftOrder = left.relativePath
    ? resolveFieldOrderIndex(left.relativePath, fieldOrder)
    : Number.MAX_SAFE_INTEGER
  const rightOrder = right.relativePath
    ? resolveFieldOrderIndex(right.relativePath, fieldOrder)
    : Number.MAX_SAFE_INTEGER
  if (leftOrder !== rightOrder) return leftOrder - rightOrder

  return left.path.localeCompare(right.path)
}

function buildIssueGroup(
  itemPrefix: string,
  arrayPath: string,
  itemIndex: number,
  issues: FormIssue[],
  fieldOrder: readonly string[],
): ArrayItemIssueGroup {
  const sortedIssues = [...issues].sort((left, right) => compareIssues(left, right, fieldOrder))

  return {
    itemPrefix,
    arrayPath,
    itemIndex,
    totalCount: sortedIssues.length,
    sortedIssues,
    headerIssues: sortedIssues.filter((issue) => issue.severity !== 'field'),
    fieldIssues: sortedIssues.filter((issue) => issue.severity === 'field'),
  }
}

/** Issues whose path equals or nests under `itemPrefix`. */
export function filterIssuesForItemPrefix(
  issues: readonly FormIssue[],
  itemPrefix: string,
): FormIssue[] {
  return issues.filter(
    (issue) => issue.path === itemPrefix || issue.path.startsWith(`${itemPrefix}.`),
  )
}

/** Group and sort issues for one array item prefix, including nested descendant paths. */
export function groupIssuesForItemPrefix(
  issues: readonly FormIssue[],
  itemPrefix: string,
  arrayPath: string,
  itemIndex: number,
  fieldOrder: readonly string[],
): ArrayItemIssueGroup {
  return buildIssueGroup(
    itemPrefix,
    arrayPath,
    itemIndex,
    filterIssuesForItemPrefix(issues, itemPrefix),
    fieldOrder,
  )
}

export function findArraySectionForIssue(
  issue: FormIssue,
  sections: readonly ArraySectionMeta[],
): ArraySectionMeta | undefined {
  if (!issue.arrayPath) return undefined

  return sections
    .filter(
      (section) =>
        issue.path.startsWith(`${section.fullName}.`) || issue.arrayPath === section.fullName,
    )
    .sort((left, right) => right.fullName.length - left.fullName.length)[0]
}

/** Sort issues globally for submit navigation and legend jump. */
export function sortFormIssues(
  issues: readonly FormIssue[],
  sections: readonly ArraySectionMeta[],
): FormIssue[] {
  return [...issues].sort((left, right) => {
    const leftSection = findArraySectionForIssue(left, sections)
    const rightSection = findArraySectionForIssue(right, sections)
    const leftOrder = leftSection?.fieldOrder ?? []
    const rightOrder = rightSection?.fieldOrder ?? []

    const severityDelta =
      FORM_ISSUE_SEVERITY_ORDER[left.severity] - FORM_ISSUE_SEVERITY_ORDER[right.severity]
    if (severityDelta !== 0) return severityDelta

    const itemIndexDelta =
      (left.itemIndex ?? Number.MAX_SAFE_INTEGER) - (right.itemIndex ?? Number.MAX_SAFE_INTEGER)
    if (itemIndexDelta !== 0) return itemIndexDelta

    return compareIssues(left, right, left.path.startsWith(right.path) ? leftOrder : rightOrder)
  })
}

/** Count distinct array item indices with at least one issue under an array path. */
export function countInvalidArrayItems(issues: readonly FormIssue[], arrayPath: string): number {
  const indices = new Set<number>()
  for (const issue of issues) {
    if (issue.arrayPath !== arrayPath && !issue.path.startsWith(`${arrayPath}.`)) continue
    if (issue.itemIndex !== undefined) indices.add(issue.itemIndex)
  }
  return indices.size
}

export type ArrayIssueIndex = Map<string, ArrayItemIssueGroup>

/** Build a lookup of itemPrefix → issue group for one array subtree. */
export function indexArrayItemIssues(
  issues: readonly FormIssue[],
  arrayPath: string,
  fieldOrder: readonly string[],
): ArrayIssueIndex {
  const index = new Map<string, ArrayItemIssueGroup>()
  const itemIndices = new Set<number>()

  for (const issue of issues) {
    if (issue.arrayPath !== arrayPath && !issue.path.startsWith(`${arrayPath}.`)) continue
    if (issue.itemIndex !== undefined) itemIndices.add(issue.itemIndex)
  }

  for (const itemIndex of itemIndices) {
    const itemPrefix = `${arrayPath}.${itemIndex}`
    index.set(
      itemPrefix,
      groupIssuesForItemPrefix(issues, itemPrefix, arrayPath, itemIndex, fieldOrder),
    )
  }

  return index
}

export { compareIssues }
