import { describe, expect, it } from 'vitest'

import {
  formatQuickNpcClassRecommendationHelper,
  formatQuickNpcLevelRecommendationPrompt,
  isQuickNpcBuildCardVisible,
  QUICK_NPC_BUILD_CHANGE_CLASS_LABEL,
  QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL,
  QUICK_NPC_BUILD_CHANGE_ROLE_LABEL,
  QUICK_NPC_BUILD_DONE_LABEL,
  resolveQuickNpcBuildCardExpandActionLabel,
} from './quick-npc-build-card.lib'
import {
  buildQuickNpcRoleRadioCardPresentation,
  QUICK_NPC_ROLE_ALL_GROUP_EYEBROW,
} from './quick-npc-npc-template-option.lib'
import { QUICK_NPC_RECOMMENDED_GROUP_EYEBROW } from './quick-npc-affinity-option-groups.lib'

const guildmasterTitle = {
  id: 'omt_guildmaster',
  label: 'Guildmaster',
  description: 'Head of the guild.',
  priority: 50 as const,
  npcRecommendation: { templateId: 'criminal' as const, level: 5 },
} as const

describe('buildQuickNpcRoleRadioCardPresentation', () => {
  it('groups the suggested template under Recommended with all others below', () => {
    const presentation = buildQuickNpcRoleRadioCardPresentation('criminal')
    expect(presentation.optionGroups?.[0]).toMatchObject({
      id: 'recommended',
      eyebrow: QUICK_NPC_RECOMMENDED_GROUP_EYEBROW,
      options: [{ value: 'criminal', label: 'Criminal' }],
    })
    expect(presentation.optionGroups?.[1]?.eyebrow).toBe(QUICK_NPC_ROLE_ALL_GROUP_EYEBROW)
    expect(presentation.optionGroups?.[1]?.options.some((o) => o.value === 'criminal')).toBe(false)
  })

  it('returns a flat list when there is no suggestion', () => {
    const presentation = buildQuickNpcRoleRadioCardPresentation(undefined)
    expect(presentation.optionGroups).toBeUndefined()
    expect(presentation.options.length).toBeGreaterThan(0)
  })
})

describe('resolveQuickNpcBuildCardExpandActionLabel', () => {
  it.each([
    ['role', QUICK_NPC_BUILD_CHANGE_ROLE_LABEL],
    ['class', QUICK_NPC_BUILD_CHANGE_CLASS_LABEL],
    ['level', QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL],
  ] as const)('returns the change label for %s when collapsed', (kind, expected) => {
    expect(resolveQuickNpcBuildCardExpandActionLabel(kind, false)).toBe(expected)
  })

  it.each(['role', 'class', 'level'] as const)('returns Done when %s row is expanded', (kind) => {
    expect(resolveQuickNpcBuildCardExpandActionLabel(kind, true)).toBe(QUICK_NPC_BUILD_DONE_LABEL)
  })
})

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
        membershipTitle: 'omt_member',
        titles: [{ id: 'omt_member', label: 'Member', priority: 10 as const }],
      }),
    ).toBeUndefined()
  })

  it('formats the recommended level prompt from the selected title', () => {
    expect(
      formatQuickNpcLevelRecommendationPrompt({
        membershipTitle: 'omt_guildmaster',
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

describe('isQuickNpcBuildCardVisible', () => {
  it('requires a resolved model and no upstream edit in progress', () => {
    expect(isQuickNpcBuildCardVisible({ buildCardModel: null, isEditingUpstream: false })).toBe(
      false,
    )
    expect(
      isQuickNpcBuildCardVisible({
        buildCardModel: { sectionEyebrow: 'Build' } as never,
        isEditingUpstream: true,
      }),
    ).toBe(false)
    expect(
      isQuickNpcBuildCardVisible({
        buildCardModel: { sectionEyebrow: 'Build' } as never,
        isEditingUpstream: false,
      }),
    ).toBe(true)
  })
})
