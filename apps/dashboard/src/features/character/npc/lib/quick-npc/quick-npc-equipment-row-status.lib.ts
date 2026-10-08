import { toEquipmentContentId, type CharacterBuildCatalogIndex } from '@rpg/contracts'

import type { EntitySummaryStatusItem } from '@/features/content'

import {
  formatBuildAdvisoryLabel,
  indexBuildAdvisoriesByEquipmentId,
  lookupBuildAdvisoriesForEquipment,
} from '@/features/character/lib/build-advisories/build-advisory-presentation.lib'
import {
  deriveEquipmentSelectionFacts,
  EMPTY_EQUIPMENT_SELECTION_FACTS,
  resolveHeldEquipmentSelectionPresentation,
  type EquipmentSelectionFacts,
} from '@/features/character/lib/equipment/equipment-selection-facts.lib'
import {
  resolveSelectionRowStatusItems,
  type SelectionRowContext,
} from '@/features/character/lib/selection-row-status'

import type { QuickNpcPreparedDraft } from './quick-npc-create'

/**
 * Whole-catalog equipment facts for the prepared Quick NPC draft (package selections,
 * retained items, and generated scores). Not the species/class/level-only draft.
 */
export function deriveQuickNpcEquipmentSelectionFacts(args: {
  prepared: QuickNpcPreparedDraft | null
  catalogIndex: CharacterBuildCatalogIndex
  rulesetId?: string
}): EquipmentSelectionFacts {
  if (!args.prepared) {
    return { ...EMPTY_EQUIPMENT_SELECTION_FACTS, rulesetId: args.rulesetId }
  }
  return deriveEquipmentSelectionFacts({
    draft: args.prepared.draft,
    catalogIndex: args.catalogIndex,
    choiceSets: args.prepared.resolvedChoiceSets,
    rulesetId: args.rulesetId,
  })
}

function equipmentForSelectionFacts(
  facts: EquipmentSelectionFacts,
  catalogIndex: CharacterBuildCatalogIndex,
  equipmentId: string,
) {
  const direct = catalogIndex.equipment.get(equipmentId)
  if (direct) return direct
  if (!facts.rulesetId) return undefined
  return catalogIndex.equipment.get(toEquipmentContentId(facts.rulesetId, equipmentId))
}

/** Context-filtered status for one equipment id. Empty when the catalog has no row. */
export function resolveQuickNpcEquipmentRowStatus(args: {
  facts: EquipmentSelectionFacts
  catalogIndex: CharacterBuildCatalogIndex
  equipmentId: string
  context: Extract<SelectionRowContext, 'edit_choice' | 'owned'>
}): EntitySummaryStatusItem[] {
  const equipment = equipmentForSelectionFacts(args.facts, args.catalogIndex, args.equipmentId)
  if (!equipment) return []
  return resolveSelectionRowStatusItems(
    resolveHeldEquipmentSelectionPresentation(args.facts, equipment),
    { context: args.context },
  )
}

/** Final-loadout advisory sentences for package rows the NPC still keeps. */
export function quickNpcPackageAdvisoryLabels(args: {
  rows: readonly { equipmentId?: string; retainedQuantity: number }[]
  advisories: QuickNpcPreparedDraft['advisories']
  rulesetId?: string
}): string[] {
  const index = indexBuildAdvisoriesByEquipmentId(args.advisories)
  return args.rows.flatMap((row) => {
    if (!row.equipmentId || row.retainedQuantity <= 0) return []
    return lookupBuildAdvisoriesForEquipment(index, row.equipmentId, args.rulesetId).map(
      formatBuildAdvisoryLabel,
    )
  })
}
