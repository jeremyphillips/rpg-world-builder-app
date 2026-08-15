import {
  isClassProgressionApplicable,
  resolveAvailableContent,
  resolveCharacterLevelConstraints,
  type CharacterBuildContext,
} from '@rpg/contracts'

import type { QuickNpcSetupValues } from './quick-npc-form-fields'
import { quickNpcSetupSchema } from './quick-npc-form-fields'

/**
 * Re-validates Setup-owned fields at authoring submit time. Setup failures should
 * return the user to the Setup phase — not surface on authoring tabs.
 */
export function isQuickNpcSetupStillValid(
  setup: QuickNpcSetupValues,
  context: CharacterBuildContext,
): boolean {
  const { minLevel, maxLevel } = resolveCharacterLevelConstraints(context)
  const parsed = quickNpcSetupSchema(maxLevel, minLevel).safeParse(setup)
  if (!parsed.success) return false

  const available = resolveAvailableContent(context)
  const speciesAvailable = available.species.some((entry) => entry.id === setup.speciesId)
  if (!speciesAvailable) return false

  if (!isClassProgressionApplicable(setup.level)) {
    return true
  }

  return available.classes.some((entry) => entry.id === setup.classId)
}
