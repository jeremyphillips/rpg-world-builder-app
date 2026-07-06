import { describe, expect, it } from 'vitest'

import { classSchema } from './class'
import { normalizeClassStored, normalizeClassStoredBody } from './normalize-class-stored'

const timestamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

const legacyHomebrewBody = {
  name: 'Blood Hunter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: ['light', 'medium'],
    weapons: { categories: ['simple', 'martial'] },
    skills: { choose: 2, from: ['athletics', 'stealth'] },
  },
  features: [],
} as const

describe('normalizeClassStoredBody', () => {
  it('migrates legacy armor arrays and proficiencies.skills choices', () => {
    const normalized = normalizeClassStoredBody({ ...legacyHomebrewBody })

    expect(normalized.proficiencies).toEqual({
      savingThrows: ['str', 'con'],
      armor: { categories: ['light', 'medium'], items: [] },
      weapons: { categories: ['simple', 'martial'], items: [] },
      skills: { categories: [], items: [] },
    })
    expect(normalized.characterCreation).toEqual({
      proficiencies: {
        skills: {
          choices: [{ id: 'class-skills', choose: 2, from: ['athletics', 'stealth'] }],
        },
      },
    })
  })

  it('strips choose/from pollution left by deep-merge onto grant sets', () => {
    const normalized = normalizeClassStoredBody({
      ...legacyHomebrewBody,
      proficiencies: {
        ...legacyHomebrewBody.proficiencies,
        skills: {
          categories: [],
          items: [],
          choose: 2,
          from: ['arcana', 'history'],
        },
      },
      characterCreation: {
        startingEquipment: {
          choose: 1,
          options: [{ id: 'gold', label: 'Gold', items: [], wealth: { gp: 50 } }],
        },
      },
    })

    expect(normalized).toMatchObject({
      proficiencies: {
        skills: { categories: [], items: [] },
      },
    })
    expect(normalized.characterCreation).toMatchObject({
      startingEquipment: {
        choose: 1,
      },
      proficiencies: {
        skills: {
          choices: [{ id: 'class-skills', choose: 2, from: ['arcana', 'history'] }],
        },
      },
    })
  })

  it('preserves existing characterCreation skill choices over legacy proficiencies.skills', () => {
    const normalized = normalizeClassStoredBody({
      ...legacyHomebrewBody,
      characterCreation: {
        proficiencies: {
          skills: {
            choices: [{ id: 'class-skills', choose: 1, from: ['medicine'] }],
          },
        },
      },
    })

    expect(normalized.characterCreation).toEqual({
      proficiencies: {
        skills: {
          choices: [{ id: 'class-skills', choose: 1, from: ['medicine'] }],
        },
      },
    })
  })
})

describe('normalizeClassStored', () => {
  it('parses through classSchema after normalization', () => {
    const normalized = normalizeClassStored({
      id: 'homebrew_1',
      slug: 'blood-hunter',
      rulesetId: 'srd-cc-5.2.1',
      source: 'homebrew',
      campaignId: 'camp_1',
      ...timestamps,
      ...legacyHomebrewBody,
    })

    expect(() => classSchema.parse(normalized)).not.toThrow()
    expect(
      classSchema.parse(normalized).characterCreation?.proficiencies?.skills?.choices?.[0],
    ).toEqual({
      id: 'class-skills',
      choose: 2,
      from: ['athletics', 'stealth'],
    })
  })
})
