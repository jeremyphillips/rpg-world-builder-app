import { describe, expect, it } from 'vitest'

import { finalizeCharacterBuild } from '../../runtime/character-builder/finalize/finalize'
import { createEmptyCharacterBuilderDraft } from '../../runtime/character-builder/draft/draft'
import { builderTestContext } from '../../runtime/character-builder/test-fixtures'
import { campaignOnboardingContextSchema } from './dtos'
import { completeCampaignOnboardingInputSchema } from '../../runtime/campaign-onboarding-completion-input'

function makeCompleteDraft() {
  return {
    ...createEmptyCharacterBuilderDraft(),
    identity: {
      name: 'Verna',
      alignment: 'ng' as const,
      narrative: { backstory: 'A veteran soldier.' },
    },
    species: { speciesId: 'srd-cc-5.2.1:dwarf' },
    class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
    abilities: {
      method: 'standard-array' as const,
      scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    },
  }
}

describe('campaignOnboardingContextSchema', () => {
  it('parses incomplete onboarding context without invite or membership ids', () => {
    const parsed = campaignOnboardingContextSchema.parse({
      status: 'onboarding_incomplete',
      mode: 'initial',
      campaignId: 'camp_1',
      campaign: { id: 'camp_1', name: 'The Shattered Vale' },
      startingLevel: 3,
    })

    expect(parsed.status).toBe('onboarding_incomplete')
    if (parsed.status === 'onboarding_incomplete') {
      expect(parsed.mode).toBe('initial')
      expect(parsed.campaignId).toBe('camp_1')
      expect(parsed.startingLevel).toBe(3)
    }
  })

  it('parses reconnect onboarding context with stale character id', () => {
    const parsed = campaignOnboardingContextSchema.parse({
      status: 'onboarding_incomplete',
      mode: 'reconnect',
      staleCharacterId: 'char_stale',
      campaignId: 'camp_1',
      campaign: { id: 'camp_1', name: 'The Shattered Vale' },
      startingLevel: 3,
    })

    expect(parsed).toMatchObject({
      status: 'onboarding_incomplete',
      mode: 'reconnect',
      staleCharacterId: 'char_stale',
    })
  })

  it('parses complete onboarding context with optional character id', () => {
    const withCharacter = campaignOnboardingContextSchema.parse({
      status: 'complete',
      campaignId: 'camp_1',
      characterId: 'char_1',
    })
    const withoutCharacter = campaignOnboardingContextSchema.parse({
      status: 'complete',
      campaignId: 'camp_1',
    })

    expect(withCharacter.status).toBe('complete')
    if (withCharacter.status === 'complete') {
      expect(withCharacter.characterId).toBe('char_1')
    }

    expect(withoutCharacter.status).toBe('complete')
    if (withoutCharacter.status === 'complete') {
      expect(withoutCharacter.characterId).toBeUndefined()
    }
  })
})

describe('completeCampaignOnboardingInputSchema', () => {
  it('parses existing-character completion input', () => {
    const parsed = completeCampaignOnboardingInputSchema.parse({
      source: 'existing',
      characterId: 'char_1',
    })

    expect(parsed).toEqual({ source: 'existing', characterId: 'char_1' })
  })

  it('parses new-character completion input', () => {
    const parsed = completeCampaignOnboardingInputSchema.parse({
      source: 'new',
      character: finalizeCharacterBuild(makeCompleteDraft(), builderTestContext),
    })

    expect(parsed.source).toBe('new')
  })
})
