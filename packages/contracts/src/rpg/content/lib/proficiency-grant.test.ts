import { describe, expect, it } from 'vitest'

import {
  armorTrainingGrantSchema,
  formatArmorTrainingGrantSentence,
  formatSkillProficiencyGrantSentence,
  formatToolProficiencyGrantSentence,
  formatWeaponProficiencyGrantSentence,
  skillProficiencyGrantSchema,
  toolProficiencyGrantSchema,
  weaponProficiencyGrantSchema,
} from './proficiency-grant'

describe('weaponProficiencyGrantSchema', () => {
  it('parses fixed weapon slugs', () => {
    expect(
      weaponProficiencyGrantSchema.parse({
        kind: 'fixed',
        weaponSlugs: ['longsword', 'rapier'],
      }),
    ).toEqual({ kind: 'fixed', weaponSlugs: ['longsword', 'rapier'] })
  })

  it('parses fixed weapon categories', () => {
    expect(
      weaponProficiencyGrantSchema.parse({
        kind: 'fixed',
        weaponCategories: ['simple'],
      }),
    ).toEqual({ kind: 'fixed', weaponCategories: ['simple'] })
  })

  it('parses a filtered choice pool', () => {
    expect(
      weaponProficiencyGrantSchema.parse({
        kind: 'choice',
        choose: 1,
        pool: { source: 'filtered', weaponCategory: 'martial' },
      }),
    ).toEqual({
      kind: 'choice',
      choose: 1,
      pool: { source: 'filtered', weaponCategory: 'martial' },
    })
  })

  it('rejects fixed grants with no slugs or categories', () => {
    expect(weaponProficiencyGrantSchema.safeParse({ kind: 'fixed' }).success).toBe(false)
  })
})

describe('toolProficiencyGrantSchema', () => {
  it('parses an any-tool choice pool', () => {
    expect(
      toolProficiencyGrantSchema.parse({
        kind: 'choice',
        choose: 3,
        pool: { source: 'any' },
      }),
    ).toEqual({ kind: 'choice', choose: 3, pool: { source: 'any' } })
  })
})

describe('skillProficiencyGrantSchema', () => {
  it('parses fixed skill ids', () => {
    expect(
      skillProficiencyGrantSchema.parse({
        kind: 'fixed',
        skillIds: ['athletics', 'stealth'],
      }),
    ).toEqual({ kind: 'fixed', skillIds: ['athletics', 'stealth'] })
  })

  it('parses an any-skill choice pool', () => {
    expect(
      skillProficiencyGrantSchema.parse({
        kind: 'choice',
        choose: 2,
        pool: { source: 'any' },
      }),
    ).toEqual({ kind: 'choice', choose: 2, pool: { source: 'any' } })
  })
})

describe('armorTrainingGrantSchema', () => {
  it('parses fixed armor categories', () => {
    expect(
      armorTrainingGrantSchema.parse({
        kind: 'fixed',
        armorCategories: ['light', 'medium'],
      }),
    ).toEqual({ kind: 'fixed', armorCategories: ['light', 'medium'] })
  })
})

describe('format proficiency grant sentences', () => {
  it('formats fixed weapon proficiency from categories', () => {
    expect(
      formatWeaponProficiencyGrantSentence({
        kind: 'fixed',
        weaponCategories: ['simple'],
      }),
    ).toBe('Character gains proficiency with all simple weapons.')
  })

  it('formats fixed weapon proficiency from specific weapons', () => {
    expect(
      formatWeaponProficiencyGrantSentence(
        {
          kind: 'fixed',
          weaponSlugs: ['longsword', 'shortbow'],
        },
        (slug) => (slug === 'longsword' ? 'Longsword' : 'Shortbow'),
      ),
    ).toBe('Character gains proficiency with Longsword and Shortbow.')
  })

  it('formats filtered weapon choice pool', () => {
    expect(
      formatWeaponProficiencyGrantSentence({
        kind: 'choice',
        choose: 2,
        pool: { source: 'filtered', weaponCategory: 'simple' },
      }),
    ).toBe('Character chooses 2 weapon proficiencies from simple weapons.')
  })

  it('formats any-skill choice', () => {
    expect(
      formatSkillProficiencyGrantSentence({
        kind: 'choice',
        choose: 2,
        pool: { source: 'any' },
      }),
    ).toBe('Character chooses 2 skill proficiencies from any skills.')
  })

  it('formats fixed skill proficiency with skill sentence forms', () => {
    expect(
      formatSkillProficiencyGrantSentence({
        kind: 'fixed',
        skillIds: ['animal-handling', 'sleight-of-hand'],
      }),
    ).toBe('Character gains proficiency in animal handling and sleight of hand.')
  })

  it('formats any-tool choice', () => {
    expect(
      formatToolProficiencyGrantSentence({
        kind: 'choice',
        choose: 1,
        pool: { source: 'any' },
      }),
    ).toBe('Character chooses 1 tool proficiency from any tools.')
  })

  it('formats filtered tool choice pool with vocab sentence forms', () => {
    expect(
      formatToolProficiencyGrantSentence({
        kind: 'choice',
        choose: 2,
        pool: { source: 'filtered', toolCategory: 'thieves' },
      }),
    ).toBe("Character chooses 2 tool proficiencies from sets of thieves' tools.")
  })

  it('formats armor training choice from category', () => {
    expect(
      formatArmorTrainingGrantSentence({
        kind: 'choice',
        choose: 1,
        pool: { source: 'filtered', armorCategory: 'heavy' },
      }),
    ).toBe('Character chooses 1 armor training from heavy armor.')
  })
})
