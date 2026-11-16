import type { MasterDetailEditorIdentity } from '../../components/master-detail/master-detail-editor-shell'
import { resolveMasterDetailRowKey } from './content-campaign-availability'
import type { EmbeddedMasterDetailRow } from './build-embedded-master-detail-rows'
import type { MasterDetailAvailabilityPresentation } from './master-detail-availability.types'
import type { EmbeddedListDisplay } from './resolve-embedded-list-display'

export function buildSelectedMasterDetailIdentity(input: {
  selectedRow: EmbeddedMasterDetailRow
  row: unknown
  listDisplay: EmbeddedListDisplay
  issueCount: number
  headerIssues: readonly { path: string; message: string }[]
  availability?: MasterDetailAvailabilityPresentation
  onAvailabilityChange?: () => void
}): MasterDetailEditorIdentity {
  const { resolution } = input.listDisplay
  return {
    title: input.selectedRow.item.title,
    rowKey: resolveMasterDetailRowKey(input.selectedRow.fieldId, input.row as { id?: string }),
    meta: input.selectedRow.item.meta,
    deletable: input.selectedRow.item.deletable,
    ...(resolution?.sourceName ? { sourceName: resolution.sourceName } : {}),
    ...(resolution?.inlineTitle ? { inlineTitle: resolution.inlineTitle } : {}),
    ...(input.issueCount > 0 ? { issueCount: input.issueCount } : {}),
    ...(input.headerIssues.length > 0 ? { headerIssues: input.headerIssues } : {}),
    ...(input.availability && input.onAvailabilityChange
      ? {
          availability: input.availability,
          onAvailabilityChange: input.onAvailabilityChange,
        }
      : {}),
  }
}
