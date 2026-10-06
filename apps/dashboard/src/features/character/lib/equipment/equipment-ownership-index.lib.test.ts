import { describe, expect, it } from 'vitest'

import {
  buildMagicItemAllowanceId,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
  standardStartingWealthTableId,
  startingEquipmentChoiceSetId,
  type CharacterBuilderDraft,
} from '@rpg/contracts'

import {
  equipmentStepBardClassFixture,
  equipmentStepHeroMagicItemWealthFixture,
  equipmentStepPotionOfHealingFixture,
  equipmentStepRationsFixture,
} from './equipment-step.fixtures'
import {
  buildEquipmentPickerOwnershipIndex,
  getEquipmentOwnership,
} from './equipment-ownership-index.lib'

const RULESET = 'srd-cc-5.2.1' as const
const TABLE_ID = standardStartingWealthTableId(RULESET)

const catalogIndex = indexCharacterBuildCatalog({
  species: [],
  classes: [equipmentStepBardClassFixture],
  spells: [],
  equipment: [equipmentStepRationsFixture, equipmentStepPotionOfHealingFixture],
  skillProficiencies: [],
  organizations: [],
  languages: [],
})

function goldDraft(
  equipment: Partial<NonNullable<CharacterBuilderDraft['equipment']>>,
): CharacterBuilderDraft {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: equipmentStepBardClassFixture.id, level: 1 },
    choiceSelections: {
      [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
    },
    equipment: {
      mode: 'gold',
      purchases: [],
      magicItemSelections: [],
      editedSincePackageSelection: false,
      ...equipment,
    },
  }
}

describe('buildEquipmentPickerOwnershipIndex', () => {
  it('returns an empty ownership for ids with no contributions', () => {
    const index = buildEquipmentPickerOwnershipIndex({ draft: goldDraft({}), catalogIndex })

    expect(getEquipmentOwnership(index, equipmentStepRationsFixture.id)).toMatchObject({
      totalQuantity: 0,
      acquiredQuantity: 0,
      contributions: [],
    })
  })

  it('splits editable and locked purchases and sums their spend', () => {
    const draft = goldDraft({
      purchases: [
        {
          equipmentId: equipmentStepRationsFixture.id,
          quantity: 2,
          sourceMode: 'startingGold',
          origin: 'picker',
        },
        {
          equipmentId: equipmentStepRationsFixture.id,
          quantity: 1,
          sourceMode: 'manual',
        },
      ],
    })

    const ownership = getEquipmentOwnership(
      buildEquipmentPickerOwnershipIndex({ draft, catalogIndex }),
      equipmentStepRationsFixture.id,
    )

    expect(ownership.editablePurchased.quantity).toBe(2)
    expect(ownership.lockedPurchased.quantity).toBe(1)
    expect(ownership.editablePurchased.spendCp).toBe(ownership.lockedPurchased.spendCp * 2)
    expect(ownership.totalQuantity).toBe(3)
    expect(ownership.acquiredQuantity).toBe(3)
  })

  it('lists one choice per allowance and counts it as acquired', () => {
    const allowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: TABLE_ID,
      tierId: 'hero',
      rarity: 'common',
    })
    const draft = goldDraft({
      magicItemSelections: [
        { allowanceId, equipmentId: equipmentStepPotionOfHealingFixture.id, quantity: 1 },
      ],
    })

    const ownership = getEquipmentOwnership(
      buildEquipmentPickerOwnershipIndex({
        draft,
        catalogIndex,
        options: { startingWealth: equipmentStepHeroMagicItemWealthFixture },
      }),
      equipmentStepPotionOfHealingFixture.id,
    )

    expect(ownership.choices).toEqual([
      { allowanceId, rarity: 'common', requirement: 'exact', quantity: 1 },
    ])
    expect(ownership.totalQuantity).toBe(1)
    expect(ownership.acquiredQuantity).toBe(1)
  })
})
