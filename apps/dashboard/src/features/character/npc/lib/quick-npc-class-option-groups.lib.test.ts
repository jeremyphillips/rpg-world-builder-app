import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { pickClass } from '@/test/fixtures/pick'

import {
  buildQuickNpcClassRadioCardPresentation,
  QUICK_NPC_CLASS_AFFINITY_GROUP_EYEBROW,
  QUICK_NPC_CLASS_ALL_GROUP_EYEBROW,
} from './quick-npc-class-option-groups.lib'

describe('buildQuickNpcClassRadioCardPresentation', () => {
  const fighter = pickClass('fighter')
  const rogue = pickClass('rogue')
  const wizard = pickClass('wizard')
  const playableClasses = [fighter, rogue, wizard]
  const classOptions = playableClasses.map((characterClass) => ({
    value: characterClass.id,
    label: characterClass.name,
  }))

  it('returns a flat picker when no affinity survivors exist', () => {
    const availableClassOptions = classOptions.filter((option) => option.value !== wizard.id)

    expect(
      buildQuickNpcClassRadioCardPresentation({
        classOptions: availableClassOptions,
        memberClassAffinityIds: [wizard.id],
        playableClasses: [fighter, rogue],
      }),
    ).toEqual({
      options: [
        { value: fighter.id, label: 'Fighter' },
        { value: rogue.id, label: 'Rogue' },
      ],
    })
  })

  it('groups recommended classes ahead of all classes when survivors exist', () => {
    expect(
      buildQuickNpcClassRadioCardPresentation({
        classOptions,
        memberClassAffinityIds: [rogue.id, wizard.id],
        playableClasses,
      }),
    ).toEqual({
      options: classOptions.map((option) => ({ value: option.value, label: option.label })),
      optionGroups: [
        {
          id: 'recommended',
          eyebrow: QUICK_NPC_CLASS_AFFINITY_GROUP_EYEBROW,
          options: [
            { value: rogue.id, label: 'Rogue' },
            { value: wizard.id, label: 'Wizard' },
          ],
        },
        {
          id: 'all-classes',
          eyebrow: QUICK_NPC_CLASS_ALL_GROUP_EYEBROW,
          options: [{ value: fighter.id, label: 'Fighter' }],
        },
      ],
    })
  })

  it('does not recommend unavailable Paladin affinity classes', () => {
    const paladin = {
      ...pickClass('paladin'),
      campaignAccess: { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, available: false },
    }

    expect(
      buildQuickNpcClassRadioCardPresentation({
        classOptions: [{ value: fighter.id, label: fighter.name }],
        memberClassAffinityIds: [paladin.id],
        playableClasses: [fighter],
      }),
    ).toEqual({
      options: [{ value: fighter.id, label: 'Fighter' }],
    })
  })

  it('omits the all-classes group when every available class is recommended', () => {
    expect(
      buildQuickNpcClassRadioCardPresentation({
        classOptions: classOptions.filter((option) => option.value !== wizard.id),
        memberClassAffinityIds: [fighter.id, rogue.id],
        playableClasses: [fighter, rogue],
      }).optionGroups,
    ).toEqual([
      {
        id: 'recommended',
        eyebrow: QUICK_NPC_CLASS_AFFINITY_GROUP_EYEBROW,
        options: [
          { value: fighter.id, label: 'Fighter' },
          { value: rogue.id, label: 'Rogue' },
        ],
      },
    ])
  })
})
