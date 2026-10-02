import { describe, expect, it } from 'vitest'

import {
  equipmentStepBardClassFixture,
  equipmentStepBattleaxeFixture,
  equipmentStepContextFixture,
  equipmentStepSpearFixture,
} from '../../../lib/equipment/equipment-step.fixtures'
import { quickNpcStandaloneSetupValues } from './quick-npc-test-fixtures'
import { resolveQuickNpcAdditionalEquipmentOptions } from './quick-npc-additional-equipment.lib'

describe('resolveQuickNpcAdditionalEquipmentOptions', () => {
  it('lifts role equipment preferences in the add-equipment list', () => {
    const options = resolveQuickNpcAdditionalEquipmentOptions({
      setup: quickNpcStandaloneSetupValues({
        speciesId: 'species-1',
        classId: equipmentStepBardClassFixture.id,
        level: 1,
        npcTemplateId: 'guard',
      }),
      context: equipmentStepContextFixture,
    })
    const spear = options.find((entry) => entry.option.value === equipmentStepSpearFixture.id)
    expect(spear?.pickerItem.state.resolved?.recommendation.signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          strength: 'strong',
          source: { kind: 'role', id: 'guard' },
        }),
      ]),
    )

    const spearIndex = options.findIndex(
      (entry) => entry.option.value === equipmentStepSpearFixture.id,
    )
    const battleaxeIndex = options.findIndex(
      (entry) => entry.option.value === equipmentStepBattleaxeFixture.id,
    )
    expect(spearIndex).toBeGreaterThanOrEqual(0)
    expect(battleaxeIndex).toBeGreaterThan(spearIndex)
  })
})
