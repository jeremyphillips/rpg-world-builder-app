import { AlertTriangle } from 'lucide-react'

import { masterDetailEditorIssueSummaryClasses } from './master-detail-editor-panel.variants'

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
    <span className={masterDetailEditorIssueSummaryClasses}>
      <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
      {masterDetailEditorIssueCountLabel(count)}
    </span>
  )
}
