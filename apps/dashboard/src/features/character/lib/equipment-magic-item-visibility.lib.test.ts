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
      magicItemGrants: [{ rarity: 'rare' as const, quantity: 1 }],
    },
  ],
}

describe('isMagicItemPickerItemVisible', () => {
  it('keeps a filled rare allowance selection visible for manage/release', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [],
      spells: [],
      equipment: [rareAmulet],
      skillProficiencies: [],
      languages: [],
    })

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
        context: resolveEquipmentAcquisitionContext({
          context: {
            rulesetId: RULESET,
            characterCreationRules: { startingWealth },
          } as Parameters<typeof resolveEquipmentAcquisitionContext>[0]['context'],
          catalogIndex,
        }),
      }),
    ).toBe(true)
  })
})
