import type { FormValueSync } from '@rpg/ui/form'

import {
  QUICK_NPC_ADDITIONAL_EQUIPMENT_FIELD_NAME,
  QUICK_NPC_REQUIRED_SPELL_FIELD_NAME,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import { resolveQuickNpcAdditionalEquipmentValidIds } from './quick-npc-additional-equipment.lib'
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
  const { spellIds: validSpellIds } = resolveQuickNpcRequirementValidIds({
    setup,
    context,
  })
  const validEquipmentIds = resolveQuickNpcAdditionalEquipmentValidIds({ setup, context })

  const additionalEquipmentIds = asStringArray(values[QUICK_NPC_ADDITIONAL_EQUIPMENT_FIELD_NAME])
  const requiredSpellIds = asStringArray(values[QUICK_NPC_REQUIRED_SPELL_FIELD_NAME])

  const filteredEquipment = additionalEquipmentIds.filter((id) => validEquipmentIds.has(id))
  const intersected = intersectQuickNpcRequirementIds({
    requiredWeaponIds: [],
    requiredSpellIds,
    validWeaponIds: new Set(),
    validSpellIds,
  })

  const equipmentChanged =
    filteredEquipment.length !== additionalEquipmentIds.length ? filteredEquipment : undefined
  const spellChanged = intersected?.requiredSpellIds

  if (!equipmentChanged && !spellChanged) return undefined

  return {
    ...(equipmentChanged ? { [QUICK_NPC_ADDITIONAL_EQUIPMENT_FIELD_NAME]: equipmentChanged } : {}),
    ...(spellChanged ? { [QUICK_NPC_REQUIRED_SPELL_FIELD_NAME]: spellChanged } : {}),
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
