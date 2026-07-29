import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import type { ClassStored } from '../../../../content/classes/class'
import { standardStartingWealthTableId } from '../../../../campaign/rules/starting-wealth'
import { indexCharacterBuildCatalog } from '../../context'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import {
  applyMagicItemAcquisitionIntent,
  resolveEquipmentAcquisitionBuilderContext,
} from '../equipment/apply-equipment-intents'
import { startingEquipmentChoiceSetId } from '../equipment/resolve-starting-equipment-choice-sets'
import {
  compareMagicItemBestMatch,
  getMagicItemPickerActionRank,
  type MagicItemActionState,
} from './magic-item-picker-action-rank'
import type { EquipmentPickerItem } from './equipment-picker-item'

const RULESET = 'srd-cc-5.2.1' as const
const TABLE_ID = standardStartingWealthTableId(RULESET)

const commonPotion = equipmentSchema.parse({
  id: `${RULESET}:potion-of-healing`,
  slug: 'potion-of-healing',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Potion of Healing',
  description: '',
  cost: { amount: 50, currency: 'gp' },
  kind: 'magic_item',
  rarity: 'common',
  magicItemCategory: 'potion',
})

const fighterClass = {
  id: `${RULESET}:fighter`,
  slug: 'fighter',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Fighter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 100 },
        },
      ],
    },
  },
  features: [],
} satisfies ClassStored

const startingWealth = {
  name: 'Standard',
  scope: { kind: 'standard' as const },
  tiers: [
    {
      id: 'hero',
      label: 'Hero',
      minLevel: 1,
      maxLevel: 20,
      includeNormalStartingEquipment: true,
      bonusGold: null,
      magicItemGrants: [{ rarity: 'common' as const, quantity: 1 }],
    },
  ],
}

function buildMagicItemContext() {
  const catalogIndex = indexCharacterBuildCatalog({
    classes: [fighterClass],
    equipment: [commonPotion],
    species: [],
    spells: [],
    skillProficiencies: [],
    organizations: [],
    languages: [],
  })

  const context = resolveEquipmentAcquisitionBuilderContext({
    context: {
      rulesetId: RULESET,
      characterCreationRules: { startingWealth },
      catalog: { equipment: [commonPotion] },
    },
    catalogIndex,
    startingWealthTableId: TABLE_ID,
  })

  const draft = {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: fighterClass.id, level: 1 as const },
    choiceSelections: {
      [startingEquipmentChoiceSetId(fighterClass.id)]: ['starting-gold'],
    },
    equipment: {
      mode: 'gold' as const,
      purchases: [],
      magicItemSelections: [],
      removedPackageItemKeys: [],
      customized: false,
    },
  }

  return { draft, context }
}

function makeMagicPickerItem(
  equipment: typeof commonPotion,
  magicItemAction?: MagicItemActionState,
): EquipmentPickerItem {
  return {
    equipment,
    searchDocument: {
      id: equipment.id,
      fields: [{ key: 'combined', text: equipment.name.toLowerCase(), role: 'primary' }],
    },
    state: {
      isAvailable: true,
      isRecommended: false,
      isProficient: true,
      isAffordable: true,
      isWithinRemainingBudget: true,
      purchaseAvailability: { status: 'available' },
      recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
      disabledReasons: [],
      magicItemAction,
    },
  }
}

describe('getMagicItemPickerActionRank', () => {
  it('returns grant_available when a choice slot is open', () => {
    const { draft, context } = buildMagicItemContext()

    expect(
      getMagicItemPickerActionRank({
        equipment: commonPotion,
        draft,
        context,
      }),
    ).toEqual({ rank: 0, reason: 'grant_available' })
  })

  it('returns manageable for owned items and bumps rank when out of focused scope', () => {
    const { draft, context } = buildMagicItemContext()
    const ownedDraft = applyMagicItemAcquisitionIntent({
      draft,
      context,
      equipment: commonPotion,
      requestedQuantity: 1,
    }).draft

    expect(
      getMagicItemPickerActionRank({
        equipment: commonPotion,
        draft: ownedDraft,
        context,
      }),
    ).toEqual({ rank: 1, reason: 'manageable' })

    expect(
      getMagicItemPickerActionRank({
        equipment: commonPotion,
        draft: ownedDraft,
        context,
        outOfFocusedScope: true,
      }),
    ).toEqual({ rank: 2, reason: 'manageable', outOfFocusedScope: true })
  })
})

describe('compareMagicItemBestMatch', () => {
  it('orders grant_available before no_matching_choice before unavailable', () => {
    const grantAvailable = makeMagicPickerItem(commonPotion, {
      rank: 0,
      reason: 'grant_available',
    })
    const noSlot = makeMagicPickerItem(commonPotion, {
      rank: 2,
      reason: 'no_matching_choice',
    })
    const unavailable = makeMagicPickerItem(commonPotion, {
      rank: 3,
      reason: 'unavailable',
    })

    expect(compareMagicItemBestMatch(grantAvailable, noSlot)).toBeLessThan(0)
    expect(compareMagicItemBestMatch(noSlot, unavailable)).toBeLessThan(0)
    expect(compareMagicItemBestMatch(unavailable, grantAvailable)).toBeGreaterThan(0)
  })
})
