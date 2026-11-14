import type { MasterDetailAvailabilityPresentation } from '../../lib/master-detail/master-detail-availability.types'
import { MasterDetailAvailabilityHeaderLine } from './master-detail-availability-header-line'
import { MasterDetailEditorIssueSummary } from './master-detail-editor-issue-summary'

export interface MasterDetailEditorStatusRowProps {
  availability?: MasterDetailAvailabilityPresentation
  onAvailabilityChange?: () => void
  issueCount?: number
  headerIssues?: readonly { path: string; message: string }[]
}

/** Broad availability and selected-row validation summary on one header line. */
export function MasterDetailEditorStatusRow({
  availability,
  onAvailabilityChange,
  issueCount = 0,
  headerIssues = [],
}: MasterDetailEditorStatusRowProps) {
  const showAvailability = Boolean(availability && onAvailabilityChange)
  const showIssues = issueCount > 0

  if (!showAvailability && !showIssues && headerIssues.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-x-6 pt-0.5 text-style-caption">
      {showAvailability && availability && onAvailabilityChange ? (
        <MasterDetailAvailabilityHeaderLine
          availability={availability}
          onAvailabilityChange={onAvailabilityChange}
        />
      ) : null}
      {showIssues ? <MasterDetailEditorIssueSummary count={issueCount} /> : null}
      {headerIssues.length > 0 ? (
        <ul role="alert" className="m-0 flex list-none flex-col gap-1 p-0 text-destructive-muted">
          {headerIssues.map((issue) => (
            <li key={issue.path}>{issue.message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
