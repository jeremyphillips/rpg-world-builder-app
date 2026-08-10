import type { FormValueSync } from '@rpg/ui/form'

import {
  QUICK_NPC_REQUIRED_SPELL_FIELD_NAME,
  QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME,
  resolveQuickNpcRequirementCategories,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'

function clearInvalidRequirementSelections(
  values: Record<string, unknown>,
  setup: QuickNpcSetupValues,
  context: Parameters<typeof resolveQuickNpcRequirementCategories>[0]['context'],
): Partial<Record<string, unknown>> | undefined {
  const categories = resolveQuickNpcRequirementCategories({ setup, context })
  const patch: Partial<Record<string, unknown>> = {}

  const weaponId = values[QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME]
  if (
    typeof weaponId === 'string' &&
    weaponId !== '' &&
    !categories.weapons.some((option) => option.value === weaponId)
  ) {
    patch[QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME] = ''
  }

  const spellId = values[QUICK_NPC_REQUIRED_SPELL_FIELD_NAME]
  if (
    typeof spellId === 'string' &&
    spellId !== '' &&
    !categories.spells.some((option) => option.value === spellId)
  ) {
    patch[QUICK_NPC_REQUIRED_SPELL_FIELD_NAME] = ''
  }

  return Object.keys(patch).length > 0 ? patch : undefined
}

export function createQuickNpcFormValueSyncs(
  context: Parameters<typeof resolveQuickNpcRequirementCategories>[0]['context'],
): FormValueSync[] {
  return [
    {
      dependsOn: ['speciesId', 'classId', 'level'],
      apply: (values, changedKeys) => {
        if (
          !changedKeys.some((key) => key === 'speciesId' || key === 'classId' || key === 'level')
        ) {
          return undefined
        }

        const setup: QuickNpcSetupValues = {
          speciesId: typeof values.speciesId === 'string' ? values.speciesId : '',
          classId: typeof values.classId === 'string' ? values.classId : '',
          level: typeof values.level === 'number' ? values.level : 1,
        }

        return clearInvalidRequirementSelections(values, setup, context)
      },
    },
  ]
}
