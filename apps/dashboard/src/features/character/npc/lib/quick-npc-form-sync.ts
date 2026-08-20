import type { FormValueSync } from '@rpg/ui/form'

import {
  QUICK_NPC_REQUIRED_SPELL_FIELD_NAME,
  QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import {
  intersectQuickNpcRequirementIds,
  resolveQuickNpcRequirementValidIds,
} from './quick-npc-requirement-options.lib'

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === 'string')
}

function syncRequirementSelections(
  values: Record<string, unknown>,
  setup: QuickNpcSetupValues,
  context: Parameters<typeof resolveQuickNpcRequirementValidIds>[0]['context'],
): Partial<Record<string, unknown>> | undefined {
  const { weaponIds: validWeaponIds, spellIds: validSpellIds } = resolveQuickNpcRequirementValidIds(
    {
      setup,
      context,
    },
  )

  const requiredWeaponIds = asStringArray(values[QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME])
  const requiredSpellIds = asStringArray(values[QUICK_NPC_REQUIRED_SPELL_FIELD_NAME])

  const intersected = intersectQuickNpcRequirementIds({
    requiredWeaponIds,
    requiredSpellIds,
    validWeaponIds,
    validSpellIds,
  })
  if (!intersected) return undefined

  return {
    [QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME]: intersected.requiredWeaponIds,
    [QUICK_NPC_REQUIRED_SPELL_FIELD_NAME]: intersected.requiredSpellIds,
  }
}

export function createQuickNpcFormValueSyncs(
  context: Parameters<typeof resolveQuickNpcRequirementValidIds>[0]['context'],
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

        // Title does not affect requirement reachability; standalone setup omits membership title.
        const setup: QuickNpcSetupValues = {
          contextKind: 'standalone',
          speciesId: typeof values.speciesId === 'string' ? values.speciesId : '',
          classId: typeof values.classId === 'string' ? values.classId : '',
          level: typeof values.level === 'number' ? values.level : 1,
        }

        return syncRequirementSelections(values, setup, context)
      },
    },
  ]
}
