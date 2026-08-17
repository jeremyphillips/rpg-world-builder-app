import { describe, expect, it } from 'vitest'

import type { CampaignNpcBuildContext } from '../context'
import {
  isClassProgressionApplicable,
  isLevelZeroNpcPermitted,
  resolveCharacterLevelConstraints,
  sanitizeClassForLevel,
} from './character-level-policy'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { createCharacterBuildContext } from '../test-fixtures'

function createCampaignNpcContext(): CampaignNpcBuildContext {
  return {
    ...createCharacterBuildContext({
      characterKind: 'npc',
      rulesScope: { type: 'campaign', campaignId: 'campaign-1', rulesetId: 'srd-cc-5.2.1' },
      ownershipTarget: { type: 'campaign', campaignId: 'campaign-1' },
    }),
    mode: 'dashboard',
    scope: { type: 'campaign', campaignId: 'campaign-1', rulesetId: 'srd-cc-5.2.1' },
    acquisition: { kind: 'campaign_npc', campaignId: 'campaign-1' },
    playActor: { kind: 'npc' },
  } as CampaignNpcBuildContext
}

describe('isClassProgressionApplicable', () => {
  it('is false at level 0 and true at level 1+', () => {
    expect(isClassProgressionApplicable(0)).toBe(false)
    expect(isClassProgressionApplicable(1)).toBe(true)
  })
})

describe('resolveCharacterLevelConstraints', () => {
  it('allows level 0 minimum for campaign NPCs when level zero NPCs are enabled', () => {
    const context = createCampaignNpcContext()
    expect(
      resolveCharacterLevelConstraints({
        characterKind: context.characterKind,
        rulesScope: context.rulesScope,
        characterCreationRules: context.characterCreationRules,
      }),
    ).toMatchObject({
      mode: 'selectable',
      minLevel: 0,
      maxLevel: 20,
    })
  })

  it('fixes campaign PC level to starting level', () => {
    const context = createCharacterBuildContext({
      characterKind: 'pc',
      rulesScope: { type: 'campaign', campaignId: 'campaign-1', rulesetId: 'srd-cc-5.2.1' },
      ownershipTarget: { type: 'user' },
      characterCreationRules: {
        ...createCharacterBuildContext().characterCreationRules,
        startingLevel: 3,
      },
    })

    expect(
      resolveCharacterLevelConstraints({
        characterKind: context.characterKind,
        rulesScope: context.rulesScope,
        characterCreationRules: context.characterCreationRules,
      }),
    ).toMatchObject({
      mode: 'fixed',
      fixedLevel: 3,
      minLevel: 3,
      maxLevel: 3,
    })
  })

  it('starts standalone PCs at level 1', () => {
    const context = createCharacterBuildContext()
    expect(
      resolveCharacterLevelConstraints({
        characterKind: context.characterKind,
        rulesScope: context.rulesScope,
        characterCreationRules: context.characterCreationRules,
      }),
    ).toMatchObject({
      mode: 'selectable',
      minLevel: 1,
      maxLevel: 20,
    })
  })
})

describe('isLevelZeroNpcPermitted', () => {
  it('is true for campaign NPCs when the feature is enabled', () => {
    expect(isLevelZeroNpcPermitted(createCampaignNpcContext())).toBe(true)
  })

  it('is false for PCs', () => {
    expect(isLevelZeroNpcPermitted(createCharacterBuildContext({ characterKind: 'pc' }))).toBe(
      false,
    )
  })
})

describe('sanitizeClassForLevel', () => {
  it('strips class identity at level 0', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 0 },
    }

    expect(sanitizeClassForLevel(draft).class).toEqual({ level: 0, classId: undefined })
  })

  it('preserves class identity at level 1+', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 2 },
    }

    expect(sanitizeClassForLevel(draft).class).toEqual(draft.class)
  })
})
