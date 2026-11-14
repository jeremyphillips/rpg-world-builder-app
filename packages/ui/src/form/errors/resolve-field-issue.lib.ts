import { issueMatchesFieldPath } from './resolve-field-error-presentation.lib'
import { resolveFieldErrorMessage } from './resolve-field-error-message'
import type { FormIssue } from './form-issue.types'

function pathOwnsIssuePath(ownerPath: string, issuePath: string): boolean {
  return issuePath === ownerPath || issuePath.startsWith(`${ownerPath}.`)
}

/** First routed issue owned by a control or slot path. */
export function findRoutedIssueForFieldPath(
  issues: readonly FormIssue[],
  fieldPath: string,
): FormIssue | undefined {
  return issues.find((issue) => {
    if (issue.claim?.kind === 'field' || issue.claim?.kind === 'slot') {
      return issue.claim.target === fieldPath
    }
    return issueMatchesFieldPath(issue, fieldPath)
  })
}

/** Decoded copy for a control, preferring an explicit RHF message when present. */
export function resolveFieldIssueDisplayMessage(
  fieldPath: string,
  issues: readonly FormIssue[],
  rhfMessage?: string,
): string | undefined {
  const fromRhf = resolveFieldErrorMessage(rhfMessage)
  if (fromRhf) return fromRhf

  const routed = findRoutedIssueForFieldPath(issues, fieldPath)
  return routed ? resolveFieldErrorMessage(routed.message) : undefined
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

  return issues.filter((issue) =>
    issuePaths.some((ownerPath) => pathOwnsIssuePath(ownerPath, issue.path)),
  )
}
