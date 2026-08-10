import { resolveAvailableContent, type CharacterBuildContext } from '@rpg/contracts'

import type { QuickNpcSetupValues } from './quick-npc-form-fields'
import { quickNpcSetupSchema } from './quick-npc-form-fields'

/**
 * Re-validates Setup-owned fields at authoring submit time. Setup failures should
 * return the user to the Setup phase — not surface on authoring tabs.
 */
export function isQuickNpcSetupStillValid(
  setup: QuickNpcSetupValues,
  context: CharacterBuildContext,
  maxLevel: number,
): boolean {
  const parsed = quickNpcSetupSchema(maxLevel).safeParse(setup)
  if (!parsed.success) return false

  const available = resolveAvailableContent(context)
  return (
    available.species.some((entry) => entry.id === setup.speciesId) &&
    available.classes.some((entry) => entry.id === setup.classId)
  )
}
