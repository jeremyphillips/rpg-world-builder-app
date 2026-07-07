import { describe, expect, it } from 'vitest'

import {
  createEmptyCharacterBuilderDraft,
  resolveStartingEquipmentOptionSummaries,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import {
  buildEquipmentSelectionPatch,
  formatEquipmentSourceLabel,
  formatStartingEquipmentOptionMeta,
  hasSelectableStartingEquipmentOption,
  isStartingGoldOptionId,
  shouldShowEquipmentFallback,
} from './equipment-step.lib'
import {
  equipmentStepBardClassFixture,
  equipmentStepCatalogIndexFixture,
} from './equipment-step.fixtures'

describe('equipment-step.lib', () => {
  it('detects gold options', () => {
    expect(isStartingGoldOptionId('gold')).toBe(true)
    expect(isStartingGoldOptionId('standard')).toBe(false)
  })

  it('builds package and gold selection patches', () => {
    const draft = createEmptyCharacterBuilderDraft()
    const classId = equipmentStepBardClassFixture.id
    const choiceSetId = startingEquipmentChoiceSetId(classId)

    const packagePatch = buildEquipmentSelectionPatch({
      draft,
      classId,
      optionId: 'standard',
      choiceSetId,
      nestedSelections: {},
    })

    expect(packagePatch.choiceSelections?.[choiceSetId]).toEqual(['standard'])
    expect(packagePatch.equipment?.mode).toBe('package')

    const goldPatch = buildEquipmentSelectionPatch({
      draft,
      classId,
      optionId: 'gold',
      choiceSetId,
      nestedSelections: {},
    })

    expect(goldPatch.equipment?.mode).toBe('gold')
  })

  it('formats equipment source labels', () => {
    expect(
      formatEquipmentSourceLabel(
        [
          {
            kind: 'classStartingEquipment',
            sourceId: equipmentStepBardClassFixture.id,
            grantId: 'standard',
          },
        ],
        equipmentStepCatalogIndexFixture,
      ),
    ).toBe('From Bard starting equipment')

    expect(
      formatEquipmentSourceLabel([{ kind: 'startingGold' }], equipmentStepCatalogIndexFixture),
    ).toBe('Purchased with starting gold')
  })
})

describe('starting equipment fallback helpers', () => {
  it('shows fallback only when every package is unselectable and gold is absent', () => {
    const selectable = [
      {
        optionId: 'standard',
        label: 'Standard',
        itemsByGroup: {
          weapons: [],
          armor: [],
          tools: [],
          gear: [],
          magicItems: [],
          vehicles: [],
          mounts: [],
        },
        missingItemSlugs: [],
        unselectableReasons: [],
        isSelectable: true,
      },
    ]

    expect(hasSelectableStartingEquipmentOption(selectable)).toBe(true)
    expect(shouldShowEquipmentFallback(selectable)).toBe(false)

    const broken = [
      {
        optionId: 'broken',
        label: 'Broken',
        itemsByGroup: {
          weapons: [],
          armor: [],
          tools: [],
          gear: [],
          magicItems: [],
          vehicles: [],
          mounts: [],
        },
        missingItemSlugs: ['cloak'],
        unselectableReasons: ['cloak: Missing from catalog'],
        isSelectable: false,
      },
    ]

    expect(shouldShowEquipmentFallback(broken)).toBe(true)
  })

  it('formats option meta from resolved summaries', () => {
    const summaries = resolveStartingEquipmentOptionSummaries(
      equipmentStepBardClassFixture,
      equipmentStepCatalogIndexFixture,
    )
    const standard = summaries.find((summary) => summary.optionId === 'standard')!

    expect(formatStartingEquipmentOptionMeta(standard)).toEqual(
      expect.arrayContaining(['Leather Armor (equipped)', '1× Musical Instrument', '19 GP']),
    )
  })
})
