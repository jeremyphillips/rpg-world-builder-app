import { describe, expect, it } from 'vitest'

import type { CharacterClass } from '@rpg/contracts'

import {
  buildQuickNpcClassRadioCardPresentation,
  QUICK_NPC_CLASS_AFFINITY_GROUP_EYEBROW,
  QUICK_NPC_CLASS_ALL_GROUP_EYEBROW,
} from './quick-npc-class-option-groups.lib'

function makeClass(slug: string, id = `srd-cc-5.2.1:${slug}`): CharacterClass {
  return {
    id,
    slug,
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    primaryAbilities: ['str'],
    hitDie: 10,
    proficiencies: {
      savingThrows: ['str', 'con'],
      armor: { categories: [], items: [] },
      weapons: { categories: [], items: [] },
      skills: { categories: [], items: [] },
    },
    features: [],
  }
}

describe('buildQuickNpcClassRadioCardPresentation', () => {
  const fighter = makeClass('fighter')
  const rogue = makeClass('rogue')
  const wizard = makeClass('wizard')
  const availableClasses = [fighter, rogue, wizard]
  const classOptions = availableClasses.map((characterClass) => ({
    value: characterClass.id,
    label: characterClass.name,
  }))

  it('returns a flat picker when no affinity survivors exist', () => {
    const availableClassOptions = classOptions.filter((option) => option.value !== wizard.id)

    expect(
      buildQuickNpcClassRadioCardPresentation({
        classOptions: availableClassOptions,
        memberClassAffinityIds: [wizard.id],
        availableClasses: [fighter, rogue],
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
        availableClasses,
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

  it('omits the all-classes group when every available class is recommended', () => {
    expect(
      buildQuickNpcClassRadioCardPresentation({
        classOptions: classOptions.filter((option) => option.value !== wizard.id),
        memberClassAffinityIds: [fighter.id, rogue.id],
        availableClasses: [fighter, rogue],
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
