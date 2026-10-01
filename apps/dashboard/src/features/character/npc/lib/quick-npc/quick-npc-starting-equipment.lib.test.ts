import { describe, expect, it } from 'vitest'

import { resolveQuickNpcEquipmentCategoryStatus } from './quick-npc-starting-equipment.lib'

describe('resolveQuickNpcEquipmentCategoryStatus', () => {
  it('is complete when there are no required equipment choice sets', () => {
    expect(
      resolveQuickNpcEquipmentCategoryStatus({
        choiceSets: [],
        draftSelections: {},
        overrides: {},
      }),
    ).toBe('complete')
  })

  it('stays incomplete until a required package is filled', () => {
    const choiceSet = { id: 'fighter-package', required: true, min: 1, max: 1 }
    expect(
      resolveQuickNpcEquipmentCategoryStatus({
        choiceSets: [choiceSet],
        draftSelections: {},
        overrides: {},
      }),
    ).toBe('incomplete')
    expect(
      resolveQuickNpcEquipmentCategoryStatus({
        choiceSets: [choiceSet],
        draftSelections: { 'fighter-package': ['package-a'] },
        overrides: {},
      }),
    ).toBe('complete')
  })
})
