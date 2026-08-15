import { describe, expect, it } from 'vitest'

import {
  CREATURE_TYPE_SET_ID,
  DEFAULT_STANDARD_ARRAY,
  defaultCampaignMechanicsPatch,
  defaultLevelZeroNpcRules,
  defaultMulticlassingRules,
  defaultSubclassingRules,
  type StartingWealthTier,
} from '@rpg/contracts'

import { useIntegrationDb } from '../../../test/setup/integration-db'
import {
  characterCreationScenarios,
  enableExtendedProgressionAt30,
} from '../../../test/fixtures/character-creation'
import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import {
  INITIATE_TIER_ID,
  standardStartingWealthSeed,
  withLastTierMaxLevel,
} from '../../../test/fixtures/starting-wealth'
import { expectHttpErrorAsync } from '../../../test/expect-http-error'
import { expectStoredSparseUnset, storedRulesetPatchDoc } from '../../../test/helpers/ruleset-patch'
import {
  getRulesetPatchRead,
  updateCharacterCreationPatch,
  updateMechanicsPatch,
} from './ruleset-patch.service'
import {
  updateVocabularyEntry,
  vocabularyUsageContextForCampaign,
} from '../sets/vocabulary.service'

useIntegrationDb()

describe('getRulesetPatchRead', () => {
  it('returns resolved defaults when no patch document exists', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Defaults' })

    const patch = await getRulesetPatchRead(campaignId)

    expect(patch?.characterCreation).toMatchObject({
      startingLevel: 1,
      importedCharacters: { policy: 'disabled' },
      progression: { maxCharacterLevel: 20 },
      species: { creatureTypePolicy: { mode: 'only', ids: ['humanoid'] } },
      multiclassing: defaultMulticlassingRules(),
      subclasses: defaultSubclassingRules(),
      levelZeroNpcs: defaultLevelZeroNpcRules(),
      startingWealth: standardStartingWealthSeed(),
      standardArray: [...DEFAULT_STANDARD_ARRAY],
    })
    expect(patch?.mechanics).toEqual(defaultCampaignMechanicsPatch())
  })
})

describe('updateCharacterCreationPatch', () => {
  it('rejects extended progression when resolved tiers do not cover the new max', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Epic' })

    await expectHttpErrorAsync(
      () => updateCharacterCreationPatch(campaignId, characterCreationScenarios.extendedAt30()),
      { status: 400 },
    )
  })

  describe('extended progression with starting wealth tiers', () => {
    it('persists extended progression when tiers cover the new max', async () => {
      const { id: campaignId } = await makeTestCampaign({ name: 'Epic' })

      const patch = await updateCharacterCreationPatch(
        campaignId,
        characterCreationScenarios.extendedAt30WithTiers(),
      )

      expect(patch?.characterCreation.progression.extendedProgression).toEqual({
        tierName: 'Epic Destiny',
        maxLevel: 30,
      })

      const stored = await storedRulesetPatchDoc(campaignId)
      expect(stored?.characterCreation?.progression?.extendedProgression).toEqual({
        tierName: 'Epic Destiny',
        maxLevel: 30,
      })
    })

    it('rejects unsetting extended progression while tiers still cover the extended max', async () => {
      const { id: campaignId } = await makeTestCampaign({ name: 'Epic' })

      await enableExtendedProgressionAt30(campaignId)

      await expectHttpErrorAsync(
        () =>
          updateCharacterCreationPatch(campaignId, {
            progression: { maxCharacterLevel: 20 },
          }),
        { status: 400 },
      )
    })

    it('unsets extended progression when tiers are reset to the standard max', async () => {
      const { id: campaignId } = await makeTestCampaign({ name: 'Epic' })

      await enableExtendedProgressionAt30(campaignId)

      const patch = await updateCharacterCreationPatch(campaignId, {
        progression: { maxCharacterLevel: 20 },
        startingWealth: { tiers: withLastTierMaxLevel(20) },
      })

      expect(patch?.characterCreation.progression.extendedProgression).toBeUndefined()

      const stored = await storedRulesetPatchDoc(campaignId)
      expectStoredSparseUnset(stored?.characterCreation?.progression?.extendedProgression)
    })
  })

  it('persists creature type policy on the ruleset patch', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Types' })

    const patch = await updateCharacterCreationPatch(campaignId, {
      species: {
        creatureTypePolicy: { mode: 'only', ids: ['humanoid', 'fey'] },
      },
    })

    expect(patch?.characterCreation.species.creatureTypePolicy).toEqual({
      mode: 'only',
      ids: ['humanoid', 'fey'],
    })
  })

  it('rejects disabled creature types in the creature type policy', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Types' })

    await updateVocabularyEntry(
      vocabularyUsageContextForCampaign(campaignId),
      CREATURE_TYPE_SET_ID,
      'fey',
      {
        status: 'disabled',
      },
    )

    await expectHttpErrorAsync(
      () =>
        updateCharacterCreationPatch(campaignId, {
          species: {
            creatureTypePolicy: { mode: 'only', ids: ['humanoid', 'fey'] },
          },
        }),
      { status: 400, code: 'invalid_vocabulary' },
    )
  })

  it('persists non-default multiclassing overrides', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Multiclass' })

    const patch = await updateCharacterCreationPatch(campaignId, {
      multiclassing: {
        enabled: false,
        requirements: {
          primaryAbilityMinimum: { minimumScore: 15 },
        },
      },
    })

    expect(patch?.characterCreation.multiclassing).toMatchObject({
      enabled: false,
      requirements: {
        primaryAbilityMinimum: { enabled: true, minimumScore: 15 },
      },
    })

    const stored = await storedRulesetPatchDoc(campaignId)
    expect(stored?.characterCreation?.multiclassing?.enabled).toBe(false)
    expect(
      stored?.characterCreation?.multiclassing?.requirements?.primaryAbilityMinimum?.minimumScore,
    ).toBe(15)
  })

  it('deep-merges partial multiclassing patches without wiping sibling overrides', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Multiclass' })

    await updateCharacterCreationPatch(campaignId, {
      multiclassing: {
        requirements: {
          primaryAbilityMinimum: { minimumScore: 15 },
        },
      },
    })

    const patch = await updateCharacterCreationPatch(campaignId, {
      multiclassing: {
        requirements: {
          speciesPolicy: { enabled: true },
        },
      },
    })

    expect(patch?.characterCreation.multiclassing.requirements).toMatchObject({
      primaryAbilityMinimum: { enabled: true, minimumScore: 15 },
      speciesPolicy: { enabled: true },
      speciesLevelLimits: { enabled: false },
    })
  })

  it('unsets stored multiclassing when reverted to defaults', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Multiclass' })

    await updateCharacterCreationPatch(campaignId, {
      multiclassing: { enabled: false },
    })

    await updateCharacterCreationPatch(campaignId, {
      multiclassing: {
        enabled: true,
        requirements: {
          primaryAbilityMinimum: { enabled: true, minimumScore: 13 },
          speciesPolicy: { enabled: false },
          speciesLevelLimits: { enabled: false },
        },
      },
    })

    const stored = await storedRulesetPatchDoc(campaignId)
    expectStoredSparseUnset(stored?.characterCreation?.multiclassing)
  })

  it('persists subclassing overrides and unsets them when reverted to defaults', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Subclasses' })

    const disabled = await updateCharacterCreationPatch(campaignId, {
      subclasses: { enabled: false },
    })

    expect(disabled?.characterCreation.subclasses).toEqual({ enabled: false })
    expect((await storedRulesetPatchDoc(campaignId))?.characterCreation?.subclasses?.enabled).toBe(
      false,
    )

    await updateCharacterCreationPatch(campaignId, {
      subclasses: { enabled: true },
    })

    const stored = await storedRulesetPatchDoc(campaignId)
    expectStoredSparseUnset(stored?.characterCreation?.subclasses)
  })

  it('persists starting wealth tier patches on the ruleset patch', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Wealth' })

    const patch = await updateCharacterCreationPatch(
      campaignId,
      characterCreationScenarios.initiateWithoutClassEquipment(),
    )

    expect(
      patch?.characterCreation.startingWealth.tiers.find((tier) => tier.id === INITIATE_TIER_ID)
        ?.includeNormalStartingEquipment,
    ).toBe(false)

    const stored = await storedRulesetPatchDoc(campaignId)
    expect(
      stored?.characterCreation?.startingWealth?.tiers?.find(
        (tier: StartingWealthTier) => tier.id === INITIATE_TIER_ID,
      )?.includeNormalStartingEquipment,
    ).toBe(false)
  })

  it('unsets starting wealth when reverted to catalog seed defaults', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Wealth' })
    const seed = standardStartingWealthSeed()

    await updateCharacterCreationPatch(
      campaignId,
      characterCreationScenarios.initiateWithoutClassEquipment(),
    )

    const patch = await updateCharacterCreationPatch(campaignId, {
      startingWealth: { tiers: seed.tiers },
    })

    expect(patch?.characterCreation.startingWealth).toEqual(seed)

    const stored = await storedRulesetPatchDoc(campaignId)
    expectStoredSparseUnset(stored?.characterCreation?.startingWealth)
  })

  it('persists non-default level 0 NPC overrides including proficiencyBonus 0', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'LevelZero' })

    const patch = await updateCharacterCreationPatch(campaignId, {
      levelZeroNpcs: {
        proficiencyBonus: 0,
        armorProficiencies: { categories: ['light'], items: [] },
      },
    })

    expect(patch?.characterCreation.levelZeroNpcs).toMatchObject({
      proficiencyBonus: 0,
      armorProficiencies: { categories: ['light'], items: [] },
    })

    const stored = await storedRulesetPatchDoc(campaignId)
    expect(stored?.characterCreation?.levelZeroNpcs?.proficiencyBonus).toBe(0)
    expect(stored?.characterCreation?.levelZeroNpcs?.armorProficiencies?.categories).toEqual([
      'light',
    ])
    expect(stored?.characterCreation?.levelZeroNpcs?.weaponProficiencies).toBeUndefined()
  })

  it('unsets stored levelZeroNpcs when reverted to defaults', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'LevelZero' })

    await updateCharacterCreationPatch(campaignId, {
      levelZeroNpcs: { enabled: false },
    })

    await updateCharacterCreationPatch(campaignId, {
      levelZeroNpcs: defaultLevelZeroNpcRules(),
    })

    const stored = await storedRulesetPatchDoc(campaignId)
    expectStoredSparseUnset(stored?.characterCreation?.levelZeroNpcs)
  })

  it('does not persist empty grant-set noise for level 0 armor defaults', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'LevelZero' })

    await updateCharacterCreationPatch(campaignId, {
      levelZeroNpcs: {
        armorProficiencies: { categories: [], items: [] },
      },
    })

    const stored = await storedRulesetPatchDoc(campaignId)
    expect(stored?.characterCreation?.levelZeroNpcs?.armorProficiencies).toBeUndefined()
  })

  it('persists non-default character creation standard arrays sparsely', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'StandardArray' })

    await updateCharacterCreationPatch(campaignId, {
      standardArray: [16, 14, 13, 12, 10, 8],
    })

    const stored = await storedRulesetPatchDoc(campaignId)
    expect(stored?.characterCreation?.standardArray).toEqual([16, 14, 13, 12, 10, 8])

    await updateCharacterCreationPatch(campaignId, {
      standardArray: [...DEFAULT_STANDARD_ARRAY],
    })

    const reverted = await storedRulesetPatchDoc(campaignId)
    expectStoredSparseUnset(reverted?.characterCreation?.standardArray)
  })

  it('unsets only nested level 0 standardArray while preserving sibling overrides', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'LevelZeroArray' })

    await updateCharacterCreationPatch(campaignId, {
      levelZeroNpcs: {
        proficiencyBonus: 0,
        standardArray: [16, 14, 13, 12, 10, 8],
      },
    })

    await updateCharacterCreationPatch(campaignId, {
      levelZeroNpcs: {
        standardArray: [...DEFAULT_STANDARD_ARRAY],
      },
    })

    const stored = await storedRulesetPatchDoc(campaignId)
    expect(stored?.characterCreation?.levelZeroNpcs?.standardArray).toBeUndefined()
    expect(stored?.characterCreation?.levelZeroNpcs?.proficiencyBonus).toBe(0)
  })
})

describe('updateMechanicsPatch', () => {
  it('persists a non-default edition preset sparsely', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Classic' })

    const patch = await updateMechanicsPatch(campaignId, {
      editionPreset: { id: 'becmi' },
    })

    expect(patch?.mechanics).toMatchObject({
      editionPreset: { id: 'becmi', modified: false },
      armorClass: { mode: 'descending', base: 9 },
      attackResolution: { mode: 'attack_matrix' },
    })
    expect(patch?.mechanics.editionPreset.appliedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)

    const stored = await storedRulesetPatchDoc(campaignId)
    expect(stored?.mechanics?.editionPreset?.id).toBe('becmi')
    expect(stored?.mechanics?.editionPreset?.appliedAt).toBeInstanceOf(Date)
    expect(stored?.mechanics?.armorClass).toBeUndefined()
    expect(stored?.mechanics?.attackResolution).toBeUndefined()
  })

  it('marks modified when knobs drift from the selected preset', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Drift' })

    await updateMechanicsPatch(campaignId, { editionPreset: { id: '3e' } })

    const patch = await updateMechanicsPatch(campaignId, {
      armorClass: { base: 9 },
    })

    expect(patch?.mechanics.editionPreset).toMatchObject({ id: '3e', modified: true })
    expect(patch?.mechanics.armorClass).toEqual({ mode: 'ascending', base: 9 })

    const stored = await storedRulesetPatchDoc(campaignId)
    expect(stored?.mechanics?.editionPreset?.modified).toBe(true)
    expect(stored?.mechanics?.armorClass).toEqual({ mode: 'ascending', base: 9 })
  })

  it('clears stored mechanics when reverting to the default 5e preset', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Modern' })

    await updateMechanicsPatch(campaignId, { editionPreset: { id: '2e' } })
    const patch = await updateMechanicsPatch(campaignId, { editionPreset: { id: '5e' } })

    expect(patch?.mechanics).toEqual(defaultCampaignMechanicsPatch())

    const stored = await storedRulesetPatchDoc(campaignId)
    expectStoredSparseUnset(stored?.mechanics)
  })
})
