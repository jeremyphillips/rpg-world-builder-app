import { Icon } from '@rpg/ui'

function masterDetailEditorIssueCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'issue' : 'issues'}`
}

export interface MasterDetailEditorIssueSummaryProps {
  count: number
}

/** Presentation-only issue count for the master-detail detail identity header. */
export function MasterDetailEditorIssueSummary({ count }: MasterDetailEditorIssueSummaryProps) {
  if (count <= 0) return null

  return (
    <span className="inline-flex min-w-0 items-center gap-1 text-style-label text-destructive-muted">
      <Icon name="triangle-alert" size="inline" className="shrink-0" />
      {masterDetailEditorIssueCountLabel(count)}
    </span>
  )
}
