import { dropClassOwnedChoiceOverrides, type SystemRulesetId } from '@rpg/contracts'

import type { QuickNpcEquipmentSelection } from './quick-npc-form-fields'
import {
  reconcileQuickNpcEquipmentSelections,
  type QuickNpcEquipmentSeedContext,
} from './quick-npc-equipment-selections.lib'

export function resolveQuickNpcClassChangeAuthoringState(args: {
  overrides: Readonly<Record<string, readonly string[]>>
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  previous: QuickNpcEquipmentSeedContext
  next: QuickNpcEquipmentSeedContext & { rulesetId: SystemRulesetId }
}): {
  startingChoiceOverrides: Record<string, string[]>
  equipmentSelections: QuickNpcEquipmentSelection[]
} {
  return {
    startingChoiceOverrides: dropClassOwnedChoiceOverrides({
      overrides: args.overrides,
      previousClassId: args.previous.classId,
      nextClassId: args.next.classId,
    }),
    equipmentSelections: reconcileQuickNpcEquipmentSelections({
      current: args.equipmentSelections,
      previous: args.previous,
      next: args.next,
    }),
  }
}
