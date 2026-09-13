import { Badge } from '@rpg/ui'

import { MasterDetailAvailabilityHeaderLine } from '../../../components/master-detail/master-detail-availability-header-line'
import type { MasterDetailAvailabilityPresentation } from '../../../lib/master-detail/master-detail-availability.types'
import { resolveSubclassEditorSourceLabel } from '../../lib/subclasses/subclass-editor-panel.lib'

export function SubclassEditorPanelHeader({
  displayName,
  subclassId,
  source,
  status,
  availability,
  savePending,
  onAvailabilityChange,
}: {
  displayName: string
  subclassId: string
  source: 'system' | 'homebrew'
  status: 'draft' | 'published'
  availability: MasterDetailAvailabilityPresentation
  savePending: boolean
  onAvailabilityChange: () => void
}) {
  return (
    <div className="space-y-1 border-b border-border pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-lg font-medium text-foreground">{displayName}</h3>
        <Badge appearance="outline" tone="neutral" size="sm">
          {resolveSubclassEditorSourceLabel(subclassId, source, status)}
        </Badge>
      </div>
      <MasterDetailAvailabilityHeaderLine
        availability={availability}
        disabled={savePending}
        onAvailabilityChange={onAvailabilityChange}
      />
    </div>
  )
}
