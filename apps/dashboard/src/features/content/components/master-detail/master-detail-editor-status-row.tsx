import type { MasterDetailAvailabilityPresentation } from '../../lib/master-detail/master-detail-availability.types'
import { MasterDetailAvailabilityHeaderLine } from './master-detail-availability-header-line'
import { MasterDetailEditorIssueSummary } from './master-detail-editor-issue-summary'

export interface MasterDetailEditorStatusRowProps {
  availability?: MasterDetailAvailabilityPresentation
  onAvailabilityChange?: () => void
  issueCount?: number
}

/** Broad availability and selected-row validation summary on one header line. */
export function MasterDetailEditorStatusRow({
  availability,
  onAvailabilityChange,
  issueCount = 0,
}: MasterDetailEditorStatusRowProps) {
  const showAvailability = Boolean(availability && onAvailabilityChange)
  const showIssues = issueCount > 0

  if (!showAvailability && !showIssues) return null

  return (
    <div className="flex flex-wrap items-center gap-x-6 pt-0.5 text-style-caption">
      {showAvailability && availability && onAvailabilityChange ? (
        <MasterDetailAvailabilityHeaderLine
          availability={availability}
          onAvailabilityChange={onAvailabilityChange}
        />
      ) : null}
      {showIssues ? <MasterDetailEditorIssueSummary count={issueCount} /> : null}
    </div>
  )
}
