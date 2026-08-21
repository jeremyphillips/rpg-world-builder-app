import { describe, expect, it } from 'vitest'

import {
  buildMagicItemAllowanceId,
  createEmptyCharacterBuilderDraft,
  equipmentSchema,
  indexCharacterBuildCatalog,
  resolveEquipmentAcquisitionActionState,
  standardStartingWealthTableId,
  startingEquipmentChoiceSetId,
  type CharacterBuilderDraft,
} from '@rpg/contracts'

import { buildEquipmentPickerRowViewModel } from '@/features/content'

import {
  createEquipmentStepContextWithMagicItemGrantsFixture,
  equipmentStepHeroMagicItemWealthFixture,
  equipmentStepMonkClassFixture,
  equipmentStepPotionOfHealingFixture,
} from '../../../../lib/equipment/equipment-step.fixtures'
import { resolveEquipmentAcquisitionContext } from '../../../../lib/equipment/equipment-step.lib'
import { buildEquipmentPickerRowActionViewModel } from '../equipment-picker-action.lib'
import { resolveEquipmentPickerItemPresentation } from './equipment-picker-item-header.lib'

const RULESET = 'srd-cc-5.2.1' as const
const TABLE_ID = standardStartingWealthTableId(RULESET)

const commonCharm = equipmentSchema.parse({
  id: `${RULESET}:pearl-of-power`,
  slug: 'pearl-of-power',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Pearl of Power',
  description: '',
  cost: { amount: 50, currency: 'gp' },
  kind: 'magic_item',
  rarity: 'common',
  magicItemCategory: 'wondrous_item',
})

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

const rareWealth = {
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

function draftWithGoldOption(): CharacterBuilderDraft {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: equipmentStepMonkClassFixture.id, level: 1 },
    choiceSelections: {
      [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['starting-gold'],
    },
    equipment: {
      mode: 'gold',
      purchases: [],
      magicItemSelections: [],
      removedPackageItemKeys: [],
      customized: false,
    },
  }
}

function magicItemContext(catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>) {
  const context = createEquipmentStepContextWithMagicItemGrantsFixture({
    characterCreationRules: {
      ...createEquipmentStepContextWithMagicItemGrantsFixture().characterCreationRules,
      startingWealth: equipmentStepHeroMagicItemWealthFixture,
    },
  })

  return resolveEquipmentAcquisitionContext({ context, catalogIndex })
}

function presentationFor(args: {
  equipment: typeof equipmentStepPotionOfHealingFixture | typeof rareAmulet
  workflowMode: 'purchase' | 'magic_items'
  draft: CharacterBuilderDraft
  context: ReturnType<typeof resolveEquipmentAcquisitionContext>
  ownedQuantity?: number
}) {
  const actionState = resolveEquipmentAcquisitionActionState({
    draft: args.draft,
    context: args.context,
    equipment: args.equipment,
    workflowMode: args.workflowMode,
    requestedQuantity: 1,
  })
  const rowActionVm = buildEquipmentPickerRowActionViewModel(actionState)
  const row = buildEquipmentPickerRowViewModel(args.equipment)

  return resolveEquipmentPickerItemPresentation({
    equipment: args.equipment,
    row,
    workflowMode: args.workflowMode,
    rowActionVm,
    ownedQuantity: args.ownedQuantity ?? 0,
  })
}

describe('resolveEquipmentPickerItemPresentation', () => {
  const catalogIndex = indexCharacterBuildCatalog({
    species: [],
    classes: [equipmentStepMonkClassFixture],
    spells: [],
    equipment: [equipmentStepPotionOfHealingFixture, commonCharm],
    skillProficiencies: [],
    organizations: [],
    languages: [],
  })
  const context = magicItemContext(catalogIndex)

  it('shows purchase price and add for purchase-mode magic items', () => {
    const presentation = presentationFor({
      equipment: equipmentStepPotionOfHealingFixture,
      workflowMode: 'purchase',
      draft: draftWithGoldOption(),
      context,
    })

    expect(presentation).toMatchObject({
      secondary: { kind: 'price', label: '50 GP' },
      action: { kind: 'add', disabled: false },
    })
  })

  it('shows grant choice and add when a common choice is available', () => {
    const presentation = presentationFor({
      equipment: equipmentStepPotionOfHealingFixture,
      workflowMode: 'magic_items',
      draft: draftWithGoldOption(),
      context,
    })

    expect(presentation).toMatchObject({
      secondary: { kind: 'grantPreview', label: 'Common choice' },
      action: { kind: 'add', disabled: false },
    })
  })

  it('shows price and add when grant is exhausted but fully purchasable', () => {
    const allowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: TABLE_ID,
      tierId: 'hero',
      rarity: 'common',
    })

    const draft = {
      ...draftWithGoldOption(),
      equipment: {
        ...draftWithGoldOption().equipment!,
        magicItemSelections: [{ allowanceId, equipmentId: commonCharm.id, quantity: 2 }],
      },
    }

    const presentation = presentationFor({
      equipment: equipmentStepPotionOfHealingFixture,
      workflowMode: 'magic_items',
      draft,
      context,
    })

    expect(presentation).toMatchObject({
      secondary: { kind: 'price', label: '50 GP' },
      action: { kind: 'add', disabled: false },
    })
  })

  it('shows blocked trailing and no add for unowned blocked rows', () => {
    const rareCatalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [equipmentStepMonkClassFixture],
      spells: [],
      equipment: [rareAmulet],
      skillProficiencies: [],
      organizations: [],
      languages: [],
    })
    const rareContext = resolveEquipmentAcquisitionContext({
      context: createEquipmentStepContextWithMagicItemGrantsFixture(),
      catalogIndex: rareCatalogIndex,
    })

    const presentation = presentationFor({
      equipment: rareAmulet,
      workflowMode: 'magic_items',
      draft: draftWithGoldOption(),
      context: rareContext,
    })

    expect(presentation).toMatchObject({
      statusItems: [{ kind: 'badge', label: 'No Rare choices' }],
      action: { kind: 'none' },
    })
  })

  it('shows owned badge actions without add when owned and blocked', () => {
    const rareCatalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [equipmentStepMonkClassFixture],
      spells: [],
      equipment: [rareAmulet],
      skillProficiencies: [],
      organizations: [],
      languages: [],
    })
    const rareContext = resolveEquipmentAcquisitionContext({
      context: createEquipmentStepContextWithMagicItemGrantsFixture({
        characterCreationRules: {
          ...createEquipmentStepContextWithMagicItemGrantsFixture().characterCreationRules,
          startingWealth: rareWealth,
        },
      }),
      catalogIndex: rareCatalogIndex,
    })
    const allowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: TABLE_ID,
      tierId: 'hero',
      rarity: 'rare',
    })
    const draft = {
      ...draftWithGoldOption(),
      equipment: {
        ...draftWithGoldOption().equipment!,
        magicItemSelections: [{ allowanceId, equipmentId: rareAmulet.id, quantity: 1 }],
      },
    }

    const presentation = presentationFor({
      equipment: rareAmulet,
      workflowMode: 'magic_items',
      draft,
      context: rareContext,
      ownedQuantity: 1,
    })

    expect(presentation).toMatchObject({
      statusItems: [{ kind: 'badge', label: 'One copy maximum' }],
      action: { kind: 'manage_only' },
    })
  })
})
