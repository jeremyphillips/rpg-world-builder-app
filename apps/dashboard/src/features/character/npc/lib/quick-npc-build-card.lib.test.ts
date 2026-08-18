import { describe, expect, it } from 'vitest'

import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../components/connections/organization-membership-title-field.types'
import {
  formatQuickNpcClassRecommendationHelper,
  formatQuickNpcLevelRecommendationPrompt,
} from './quick-npc-build-card.lib'

const guildmasterTitle = {
  id: 'omt_guildmaster',
  label: 'Guildmaster',
  description: 'Head of the guild.',
  priority: 50 as const,
  npcRecommendation: { templateId: 'covert_operator' as const, level: 5 },
} as const

describe('formatQuickNpcLevelRecommendationPrompt', () => {
  it('returns undefined when title setup is untouched', () => {
    expect(
      formatQuickNpcLevelRecommendationPrompt({
        membershipTitle: undefined,
        titles: [guildmasterTitle],
      }),
    ).toBeUndefined()
  })

  it('returns undefined when the title has no recommendation', () => {
    expect(
      formatQuickNpcLevelRecommendationPrompt({
        membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
        titles: [],
      }),
    ).toBeUndefined()
  })

  it('formats the recommended level prompt from the selected title', () => {
    expect(
      formatQuickNpcLevelRecommendationPrompt({
        membershipTitle: 'Guildmaster',
        titles: [guildmasterTitle],
      }),
    ).toBe('Recommended for Guildmaster: Level 5.')
  })
})

describe('formatQuickNpcClassRecommendationHelper', () => {
  it('returns undefined when current class matches a recommendation', () => {
    expect(
      formatQuickNpcClassRecommendationHelper({
        classId: 'rogue-id',
        recommendedClassIds: ['rogue-id'],
        classOptions: [{ value: 'rogue-id', label: 'Rogue' }],
      }),
    ).toBeUndefined()
  })

  it('returns recommended labels when current class diverges', () => {
    expect(
      formatQuickNpcClassRecommendationHelper({
        classId: 'fighter-id',
        recommendedClassIds: ['rogue-id', 'wizard-id'],
        classOptions: [
          { value: 'fighter-id', label: 'Fighter' },
          { value: 'rogue-id', label: 'Rogue' },
          { value: 'wizard-id', label: 'Wizard' },
        ],
      }),
    ).toBe('Recommended: Rogue, Wizard')
  })
})
