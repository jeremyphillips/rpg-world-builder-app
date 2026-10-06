import { mapEquipmentCompactSummaryToMetadataLines } from '../../../components/equipment/picker/map-equipment-compact-summary-to-metadata-lines'
import { mapSpellPickerCompactSummaryToMetadataLines } from '../../../components/spells/picker/map-spell-picker-compact-summary-to-metadata-lines'
import { formatCatalogMetadataLines, type EntitySummaryStatusItem } from '@/features/content'

import { resolveEquipmentSelectionRowPresentation } from '../../../lib/equipment/equipment-selection-row-presentation.lib'
import { resolveSelectionRowStatusItems } from '../../../lib/selection-row-status'

import type {
  QuickNpcSpellRequirementOption,
  QuickNpcWeaponRequirementOption,
} from './quick-npc-requirement-options.lib'

export type WeaponRequirementPreviewProjection = {
  title: string
  description?: string
  status?: readonly EntitySummaryStatusItem[]
}

export type SpellRequirementPreviewProjection = {
  title: string
  description?: string
}

/** Single projector: weapon requirement VM → compact preview props. */
export function projectWeaponRequirementPreview(
  entry: QuickNpcWeaponRequirementOption,
): WeaponRequirementPreviewProjection {
  const lines = mapEquipmentCompactSummaryToMetadataLines({
    kindLabel: entry.row.kindLabel,
    comparisonGroups: entry.row.comparisonGroups,
  })

  const status = resolveSelectionRowStatusItems(
    resolveEquipmentSelectionRowPresentation({
      equipment: entry.pickerItem.equipment,
      resolved: entry.pickerItem.state.resolved,
      isProficient: entry.pickerItem.state.isProficient,
    }),
    { context: 'review' },
  )

  return {
    title: entry.row.name,
    description: lines.length > 0 ? formatCatalogMetadataLines(lines) : undefined,
    ...(status.length > 0 ? { status } : {}),
  }
}

/** Single projector: spell requirement VM → compact preview props. */
export function projectSpellRequirementPreview(
  entry: QuickNpcSpellRequirementOption,
): SpellRequirementPreviewProjection {
  const lines = mapSpellPickerCompactSummaryToMetadataLines(entry.compactSummary)
  return {
    title: entry.option.label,
    description: lines.length > 0 ? formatCatalogMetadataLines(lines) : undefined,
  }
}
