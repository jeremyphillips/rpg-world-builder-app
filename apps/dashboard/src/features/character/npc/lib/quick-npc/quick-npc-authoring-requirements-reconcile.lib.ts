import type { CharacterBuildContext } from '@rpg/contracts'

import { resolveQuickNpcAdditionalEquipmentValidIds } from './quick-npc-additional-equipment.lib'
import {
  quickNpcEquipmentSelectionSchema,
  type QuickNpcEquipmentSelection,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import { intersectQuickNpcRequirementIds } from './quick-npc-requirement-options.lib'
import { resolveQuickNpcRequirementValidIds } from './quick-npc-requirement-options.lib'

/** Parses and filters manual equipment rows against the reachable additional-equipment set. */
export function reconcileQuickNpcAuthoringRequirementValues(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  requiredSpellIds: readonly string[]
}): {
  equipmentSelections: QuickNpcEquipmentSelection[]
  requiredSpellIds: string[]
} {
  const validEquipmentIds = resolveQuickNpcAdditionalEquipmentValidIds({
    setup: args.setup,
    context: args.context,
  })
  const equipmentSelections = args.equipmentSelections.flatMap((row) => {
    const parsed = quickNpcEquipmentSelectionSchema.safeParse(row)
    if (!parsed.success || !validEquipmentIds.has(parsed.data.equipmentId)) return []
    return [parsed.data]
  })

  const { spellIds: validSpellIds } = resolveQuickNpcRequirementValidIds({
    setup: args.setup,
    context: args.context,
  })
  const intersected = intersectQuickNpcRequirementIds({
    requiredWeaponIds: [],
    requiredSpellIds: args.requiredSpellIds,
    validWeaponIds: new Set(),
    validSpellIds,
  })

  return {
    equipmentSelections,
    requiredSpellIds: [...(intersected?.requiredSpellIds ?? args.requiredSpellIds)],
  }
}
