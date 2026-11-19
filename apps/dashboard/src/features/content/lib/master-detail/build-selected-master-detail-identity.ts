import type { MasterDetailEditorIdentity } from './master-detail-editor-identity.types'
import type { EmbeddedMasterDetailRow } from './build-embedded-master-detail-rows'
import type { MasterDetailAvailabilityPresentation } from './master-detail-availability.types'
import type { EmbeddedListDisplay } from './resolve-embedded-list-display'
import { masterDetailAcquisitionAwaitingTitleResolution } from './master-detail-acquisition-awaiting-title'
import { isEmbeddedFieldArrayRowReady } from './resolve-embedded-field-array-row'

export function buildSelectedMasterDetailIdentity(input: {
  selectedRow: EmbeddedMasterDetailRow
  row: unknown
  listDisplay: EmbeddedListDisplay
  issueCount: number
  headerIssues: readonly { path: string; message: string }[]
  availability?: MasterDetailAvailabilityPresentation
  onAvailabilityChange?: () => void
  lastAddedFieldId: string | null
}): MasterDetailEditorIdentity {
  const { resolution } = input.listDisplay
  const inlineTitle = resolution?.inlineTitle
  const rowReady = isEmbeddedFieldArrayRowReady(input.row)
  const acquisitionAwaitingTitleResolution = masterDetailAcquisitionAwaitingTitleResolution({
    lastAddedFieldId: input.lastAddedFieldId,
    selectedFieldId: input.selectedRow.fieldId,
    inlineTitle,
    rowReady,
  })
  return {
    title: input.selectedRow.item.title,
    rowKey: input.selectedRow.fieldId,
    meta: input.selectedRow.item.meta,
    deletable: input.selectedRow.item.deletable,
    ...(resolution?.sourceName ? { sourceName: resolution.sourceName } : {}),
    ...(inlineTitle ? { inlineTitle } : {}),
    ...(acquisitionAwaitingTitleResolution ? { acquisitionAwaitingTitleResolution } : {}),
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
