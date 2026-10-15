import {
  type EquipmentInstanceIntegrityWarning,
  type EquipmentInstanceSummary,
} from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import type { EntitySummaryStatusItem } from '../../../lib/entity/summary/entity-summary-status.types'

import {
  EQUIPMENT_INSTANCE_EQUIPPED_STATUS_LABEL,
  EQUIPMENT_INSTANCE_MAGICAL_STATUS_LABEL,
} from './equipment-instance-status-labels.lib'

function integrityWarningLabel(
  warnings: readonly EquipmentInstanceIntegrityWarning[],
): string | undefined {
  const unknownCount = warnings.filter((row) => row.kind === 'unknown_property').length
  const inapplicableCount = warnings.filter((row) => row.kind === 'inapplicable_property').length
  const segments: string[] = []
  if (unknownCount === 1) segments.push('Unknown property')
  else if (unknownCount > 1) segments.push(`${unknownCount} unknown properties`)
  if (inapplicableCount === 1) segments.push('Inapplicable property')
  else if (inapplicableCount > 1) segments.push(`${inapplicableCount} inapplicable properties`)
  if (segments.length === 0) return undefined
  return joinInlineMetadata(segments)
}

export function mapEquipmentInstanceInventoryStatus(summary: EquipmentInstanceSummary): {
  statusComposition: 'metadata'
  status: EntitySummaryStatusItem[]
} {
  const status: EntitySummaryStatusItem[] = []

  if (summary.equipped) {
    status.push({
      kind: 'badge',
      label: EQUIPMENT_INSTANCE_EQUIPPED_STATUS_LABEL,
      tone: 'success',
    })
  }
  if (summary.magical) {
    status.push({
      kind: 'badge',
      label: EQUIPMENT_INSTANCE_MAGICAL_STATUS_LABEL,
      tone: 'neutral',
      appearance: 'soft',
    })
  }
  if (summary.metadataSegments.length > 0) {
    status.push({
      kind: 'text',
      label: joinInlineMetadata(summary.metadataSegments),
      variant: 'muted',
    })
  }
  const integrityLabel = integrityWarningLabel(summary.integrityWarnings)
  if (integrityLabel) {
    status.push({ kind: 'text', label: integrityLabel, variant: 'warning' })
  }

  return { statusComposition: 'metadata', status }
}
