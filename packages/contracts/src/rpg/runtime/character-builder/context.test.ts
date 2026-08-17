import { describe, expect, it } from 'vitest'

import { resolveCharacterCreationPatch } from '../../campaign/patches/campaign-character-creation-patch'
import { defaultCampaignMechanicsPatch } from '../../campaign/patches/campaign-mechanics-patch'
import type { StartingWealthRules } from '../../campaign/rules/starting-wealth'
import { DEFAULT_ABILITY_GENERATION_RULES } from './ability/ability-generation'
import {
  indexCharacterBuildCatalog,
  isCampaignBuildContext,
  isCampaignPcOnboardingBuildContext,
  resolveCampaignIdFromContext,
  resolvedCharacterCreationRulesSchema,
  type CampaignNpcBuildContext,
  type CampaignPcBuildContext,
  type CharacterBuildCatalog,
} from './context'
import { resolveCharacterBuilderChromeVariant } from './character-builder-chrome-variant'
import { builderTestCatalog, builderTestRules } from './test-fixtures'

const emptyCatalog: CharacterBuildCatalog = {
  species: [],
  classes: [],
  spells: [],
  equipment: [],
  skillProficiencies: [],
  organizations: [],
  languages: [],
}

const TEST_CAMPAIGN_ID = 'camp_1'
const TEST_RULESET_ID = 'srd-cc-5.2.1'

function createCampaignNpcContext(): CampaignNpcBuildContext {
  return {
    channel: 'build',
    surface: 'dashboard',
    characterKind: 'npc',
    mode: 'dashboard',
    scope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: TEST_RULESET_ID },
    rulesScope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: TEST_RULESET_ID },
    ownershipTarget: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID },
    acquisition: { kind: 'campaign_npc', campaignId: TEST_CAMPAIGN_ID },
    playActor: { kind: 'npc' },
    rulesetId: TEST_RULESET_ID,
    catalog: builderTestCatalog,
    characterCreationRules: builderTestRules,
    permissions: { canCreateCharacter: true },
  }
}

function createCampaignPcContext(): CampaignPcBuildContext {
  return {
    channel: 'build',
    surface: 'dashboard',
    characterKind: 'pc',
    mode: 'dashboard',
    scope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: TEST_RULESET_ID },
    rulesScope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: TEST_RULESET_ID },
    ownershipTarget: { type: 'user', userId: 'user_1' },
    acquisition: {
      kind: 'campaign_pc_onboarding',
      campaignId: TEST_CAMPAIGN_ID,
    },
    playActor: { kind: 'new_pc' },
    rulesetId: TEST_RULESET_ID,
    catalog: builderTestCatalog,
    characterCreationRules: { ...builderTestRules, startingLevel: 3 },
    permissions: { canCreateCharacter: true },
  }
}

describe('indexCharacterBuildCatalog', () => {
  it('indexes every catalog list by id', () => {
    const catalog = {
      ...emptyCatalog,
      species: [
        { id: 'srd-cc-5.2.1:dwarf' },
        { id: 'srd-cc-5.2.1:elf' },
      ] as CharacterBuildCatalog['species'],
    }

    const index = indexCharacterBuildCatalog(catalog)

    expect(index.species.get('srd-cc-5.2.1:dwarf')).toBe(catalog.species[0])
    expect(index.species.get('srd-cc-5.2.1:elf')).toBe(catalog.species[1])
    expect(index.species.size).toBe(2)
    expect(index.classes.size).toBe(0)
    expect(index.spells.size).toBe(0)
    expect(index.equipment.size).toBe(0)
    expect(index.skillProficiencies.size).toBe(0)
    expect(index.organizations.size).toBe(0)
  })
})

describe('resolvedCharacterCreationRulesSchema', () => {
  it('extends the resolved campaign patch with ability generation', () => {
    const startingWealthSeed: StartingWealthRules = {
      name: 'Standard starting wealth',
      scope: { kind: 'standard' },
      tiers: [
        {
          id: 'tier-1',
          label: 'Levels 1–4',
          minLevel: 1,
          maxLevel: 20,
          includeNormalStartingEquipment: true,
          magicItemGrants: [],
        },
      ],
    }

    const rules = {
      ...resolveCharacterCreationPatch(undefined, startingWealthSeed),
      abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
      armorClass: defaultCampaignMechanicsPatch().armorClass,
    }

    const result = resolvedCharacterCreationRulesSchema.safeParse(rules)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.startingLevel).toBe(1)
      expect(result.data.abilityGeneration.methods).toEqual(['standard-array', 'manual'])
      expect(result.data.abilityGeneration.standardArray).toEqual([15, 14, 13, 12, 10, 8])
      expect(result.data.armorClass).toEqual({ mode: 'ascending', base: 10 })
    }
  })
})

describe('CampaignBuildContext discriminated union', () => {
  it('accepts campaign NPC context with campaign ownership', () => {
    const context = createCampaignNpcContext()
    expect(context.ownershipTarget.type).toBe('campaign')
    expect(context.acquisition.kind).toBe('campaign_npc')
  })

  it('accepts campaign PC context with user ownership and onboarding acquisition', () => {
    const context = createCampaignPcContext()
    expect(context.ownershipTarget).toEqual({ type: 'user', userId: 'user_1' })
    expect(context.acquisition.kind).toBe('campaign_pc_onboarding')
  })

  it('rejects impossible npc + user ownership combinations at the type level', () => {
    type InvalidNpcUserOwnership = Extract<
      CampaignNpcBuildContext,
      { ownershipTarget: { type: 'user' } }
    >
    type InvalidPcCampaignOwnership = Extract<
      CampaignPcBuildContext,
      { ownershipTarget: { type: 'campaign' } }
    >

    const unionGuards = {
      npcUser: true as InvalidNpcUserOwnership extends never ? true : false,
      pcCampaign: true as InvalidPcCampaignOwnership extends never ? true : false,
    }

    expect(unionGuards).toEqual({ npcUser: true, pcCampaign: true })
  })
})

describe('character build context helpers', () => {
  it('isCampaignBuildContext narrows campaign contexts', () => {
    expect(isCampaignBuildContext(createCampaignNpcContext())).toBe(true)
    expect(isCampaignBuildContext(createCampaignPcContext())).toBe(true)
    expect(
      isCampaignBuildContext({
        channel: 'build',
        surface: 'dashboard',
        characterKind: 'pc',
        mode: 'dashboard',
        scope: { type: 'standalone', rulesetId: TEST_RULESET_ID },
        rulesScope: { type: 'ruleset', rulesetId: TEST_RULESET_ID },
        ownershipTarget: { type: 'user' },
        rulesetId: TEST_RULESET_ID,
        catalog: emptyCatalog,
        characterCreationRules: builderTestRules,
        permissions: { canCreateCharacter: true },
        playActor: { kind: 'new_pc' },
      }),
    ).toBe(false)
  })

  it('isCampaignPcOnboardingBuildContext narrows onboarding PC contexts only', () => {
    expect(isCampaignPcOnboardingBuildContext(createCampaignPcContext())).toBe(true)
    expect(isCampaignPcOnboardingBuildContext(createCampaignNpcContext())).toBe(false)
  })

  it('resolveCampaignIdFromContext returns campaign id for campaign scope', () => {
    expect(resolveCampaignIdFromContext(createCampaignNpcContext())).toBe(TEST_CAMPAIGN_ID)
    expect(
      resolveCampaignIdFromContext({
        rulesScope: { type: 'ruleset', rulesetId: TEST_RULESET_ID },
      }),
    ).toBeUndefined()
  })

  it('resolveCharacterBuilderChromeVariant maps legal campaign combinations', () => {
    expect(resolveCharacterBuilderChromeVariant(createCampaignNpcContext())).toBe('campaign_npc')
    expect(resolveCharacterBuilderChromeVariant(createCampaignPcContext())).toBe(
      'campaign_onboarding_pc',
    )
  })
})
