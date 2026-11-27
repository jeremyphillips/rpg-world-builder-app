import { resolveFieldErrorMessage } from './resolve-field-error-message'
import type { FormIssue } from './form-issue.types'

function pathOwnsIssuePath(ownerPath: string, issuePath: string): boolean {
  return issuePath === ownerPath || issuePath.startsWith(`${ownerPath}.`)
}

function slotParentPrefix(slotPath: string): string {
  const index = slotPath.lastIndexOf('.')
  return index === -1 ? '' : slotPath.slice(0, index)
}

function prefixSlotIssuePath(slotPath: string, issuePath: string): string {
  const parent = slotParentPrefix(slotPath)
  if (!parent) return issuePath
  if (issuePath === parent || issuePath.startsWith(`${parent}.`)) return issuePath
  if (issuePath === slotPath || issuePath.startsWith(`${slotPath}.`)) return issuePath
  return `${parent}.${issuePath}`
}

function issueClaimsField(issue: FormIssue, fieldPath: string): boolean {
  return (
    (issue.claim?.kind === 'field' || issue.claim?.kind === 'slot') &&
    issue.claim.target === fieldPath
  )
}

/** Every issue whose claim target is this control or slot path. */
export function findRoutedIssuesForFieldPath(
  issues: readonly FormIssue[],
  fieldPath: string,
): FormIssue[] {
  return issues.filter((issue) => issueClaimsField(issue, fieldPath))
}

/** First issue whose claim target is this control or slot path. */
export function findRoutedIssueForFieldPath(
  issues: readonly FormIssue[],
  fieldPath: string,
): FormIssue | undefined {
  return findRoutedIssuesForFieldPath(issues, fieldPath)[0]
}

/** Decoded copy for a control. Distinct claimed reasons all stay visible. */
export function resolveFieldIssueDisplayMessage(
  fieldPath: string,
  issues: readonly FormIssue[],
): string | undefined {
  const messages: string[] = []
  for (const issue of findRoutedIssuesForFieldPath(issues, fieldPath)) {
    const decoded = resolveFieldErrorMessage(issue.message)
    if (!decoded || messages.includes(decoded)) continue
    messages.push(decoded)
  }
  return messages.length > 0 ? messages.join(' ') : undefined
}

export function findRoutedIssuesForSlot(
  issues: readonly FormIssue[],
  slotPath: string,
  issuePaths: readonly string[] | undefined,
): FormIssue[] {
  const owned = issues.filter(
    (issue) => issue.claim?.kind === 'slot' && issue.claim.target === slotPath,
  )
  if (owned.length > 0) return owned

  if (!issuePaths?.length) return []

  return issues.filter((issue) => {
    if (issue.claim?.kind === 'slot' && issue.claim.target !== slotPath) return false
    return issuePaths.some((ownerPath) =>
      pathOwnsIssuePath(prefixSlotIssuePath(slotPath, ownerPath), issue.path),
    )
  })
}
