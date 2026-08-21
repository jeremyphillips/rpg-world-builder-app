import type { EquipmentPickerCallout } from '../../../components/equipment/picker/drawer/equipment-picker-drawer.types'
import { getEquipmentPickerCallout } from '../../../components/equipment/picker/callouts/equipment-picker-callout.lib'
import { mapEquipmentCompactSummaryToMetadataLines } from '../../../components/equipment/picker/map-equipment-compact-summary-to-metadata-lines'
import { mapSpellPickerCompactSummaryToMetadataLines } from '../../../components/spells/picker/map-spell-picker-compact-summary-to-metadata-lines'
import { formatCatalogMetadataLines } from '@/features/content'

import type {
  QuickNpcSpellRequirementOption,
  QuickNpcWeaponRequirementOption,
} from './quick-npc-requirement-options.lib'

export const QUICK_NPC_REQUIREMENT_CALLOUT_CONTEXT = {
  visibleStatuses: ['not_proficient'] as const,
}

export type WeaponRequirementPreviewProjection = {
  title: string
  description?: string
  callout?: EquipmentPickerCallout
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

  return {
    title: entry.row.name,
    description: lines.length > 0 ? formatCatalogMetadataLines(lines) : undefined,
    callout: getEquipmentPickerCallout(entry.pickerItem, QUICK_NPC_REQUIREMENT_CALLOUT_CONTEXT),
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
