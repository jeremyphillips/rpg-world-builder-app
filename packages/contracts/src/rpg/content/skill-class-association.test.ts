import { describe, expect, it } from 'vitest'

import { classesOfferingSkillChoice, skillSlugsFromClassChoices } from './skill-class-association'
import type { ClassStored } from './classes/class'

const storedFighter: ClassStored = {
  id: 'srd-cc-5.2.1:fighter',
  slug: 'fighter',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Fighter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 2, from: ['athletics', 'stealth'] }],
      },
    },
  },
}

const storedRogue: ClassStored = {
  ...storedFighter,
  id: 'srd-cc-5.2.1:rogue',
  slug: 'rogue',
  name: 'Rogue',
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 4, from: ['stealth', 'acrobatics'] }],
      },
    },
  },
}

describe('skillSlugsFromClassChoices', () => {
  it('returns sorted skill slugs from meaningful class skill choices', () => {
    expect(skillSlugsFromClassChoices(storedFighter)).toEqual(['athletics', 'stealth'])
  })

  it('returns an empty array when no meaningful choices exist', () => {
    expect(
      skillSlugsFromClassChoices({
        slug: 'cleric',
        characterCreation: undefined,
      }),
    ).toEqual([])
  })

  it('ignores placeholder choice rows', () => {
    expect(
      skillSlugsFromClassChoices({
        slug: 'cleric',
        characterCreation: {
          proficiencies: {
            skills: {
              choices: [{ id: 'class-skills', choose: 0, from: [] }],
            },
          },
        },
      }),
    ).toEqual([])
  })
})

describe('classesOfferingSkillChoice', () => {
  it('returns classes whose skill pools include the slug', () => {
    expect(classesOfferingSkillChoice('stealth', [storedFighter, storedRogue])).toEqual([
      expect.objectContaining({ slug: 'fighter' }),
      expect.objectContaining({ slug: 'rogue' }),
    ])
    expect(classesOfferingSkillChoice('arcana', [storedFighter, storedRogue])).toEqual([])
  })
})
