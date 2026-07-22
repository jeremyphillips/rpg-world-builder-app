import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '@rpg/contracts'
import { indexCharacterBuildCatalog, createEmptyCharacterBuilderDraft } from '@rpg/contracts'
import { buildMagicItemAllowanceId, standardStartingWealthTableId } from '@rpg/contracts'

import {
  isMagicItemPickerItemVisible,
  resolveEquipmentAcquisitionContext,
} from '../lib/equipment-step.lib'

const RULESET = 'srd-cc-5.2.1' as const
const TABLE_ID = standardStartingWealthTableId(RULESET)

const rareAmulet = equipmentSchema.parse({
  id: `${RULESET}:amulet-of-health`,
  slug: 'amulet-of-health',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Amulet of Health',
  description: '',
  cost: null,
  kind: 'magic_item',
  rarity: 'rare',
  magicItemCategory: 'wondrous_item',
})

const beadOfForce = equipmentSchema.parse({
  id: `${RULESET}:bead-of-force`,
  slug: 'bead-of-force',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Bead of Force',
  description: '',
  cost: null,
  kind: 'magic_item',
  rarity: 'rare',
  magicItemCategory: 'wondrous_item',
})

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
      magicItemGrants: [
        { rarity: 'common' as const, quantity: 2 },
        { rarity: 'rare' as const, quantity: 1 },
      ],
    },
  ],
}

function acquisitionContext(equipment: (typeof rareAmulet)[]) {
  const catalogIndex = indexCharacterBuildCatalog({
    species: [],
    classes: [],
    spells: [],
    equipment,
    skillProficiencies: [],
    languages: [],
  })

  return resolveEquipmentAcquisitionContext({
    context: {
      rulesetId: RULESET,
      characterCreationRules: { startingWealth },
    } as Parameters<typeof resolveEquipmentAcquisitionContext>[0]['context'],
    catalogIndex,
  })
}

describe('isMagicItemPickerItemVisible', () => {
  const context = acquisitionContext([rareAmulet, beadOfForce, commonPotion])

  it('keeps a filled rare allowance selection visible for manage/release', () => {
    const allowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: TABLE_ID,
      tierId: 'hero',
      rarity: 'rare',
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: `${RULESET}:fighter`, level: 1 as const },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        magicItemSelections: [{ allowanceId, equipmentId: rareAmulet.id, quantity: 1 }],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    expect(
      isMagicItemPickerItemVisible({
        equipment: rareAmulet,
        draft,
        context,
      }),
    ).toBe(true)
  })

  it('shows blocked rare items during unfocused browse', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      isMagicItemPickerItemVisible({
        equipment: beadOfForce,
        draft,
        context,
      }),
    ).toBe(true)
  })

  it('scopes focused browse to matching rarity plus owned outliers', () => {
    const commonAllowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: TABLE_ID,
      tierId: 'hero',
      rarity: 'common',
    })
    const rareAllowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: TABLE_ID,
      tierId: 'hero',
      rarity: 'rare',
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: `${RULESET}:fighter`, level: 1 as const },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        magicItemSelections: [
          { allowanceId: rareAllowanceId, equipmentId: rareAmulet.id, quantity: 1 },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    expect(
      isMagicItemPickerItemVisible({
        equipment: rareAmulet,
        draft,
        context,
        focusedAllowanceId: commonAllowanceId,
      }),
    ).toBe(true)

    expect(
      isMagicItemPickerItemVisible({
        equipment: commonPotion,
        draft,
        context,
        focusedAllowanceId: commonAllowanceId,
      }),
    ).toBe(true)

    expect(
      isMagicItemPickerItemVisible({
        equipment: beadOfForce,
        draft,
        context,
        focusedAllowanceId: commonAllowanceId,
      }),
    ).toBe(false)

    expect(
      isMagicItemPickerItemVisible({
        equipment: beadOfForce,
        draft: createEmptyCharacterBuilderDraft(),
        context,
        focusedAllowanceId: commonAllowanceId,
      }),
    ).toBe(false)
  })
})
