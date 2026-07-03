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
  it('formats fixed weapon proficiency', () => {
    expect(
      formatWeaponProficiencyGrantSentence({
        kind: 'fixed',
        weaponCategories: ['simple'],
      }),
    ).toBe('Character gains proficiency with Simple Weapon.')
  })

  it('formats any-skill choice', () => {
    expect(
      formatSkillProficiencyGrantSentence({
        kind: 'choice',
        choose: 2,
        pool: { source: 'any' },
      }),
    ).toBe('Character chooses 2 any skills.')
  })

  it('formats any-tool choice', () => {
    expect(
      formatToolProficiencyGrantSentence({
        kind: 'choice',
        choose: 1,
        pool: { source: 'any' },
      }),
    ).toBe('Character chooses 1 any tool.')
  })

  it('formats armor training choice from category', () => {
    expect(
      formatArmorTrainingGrantSentence({
        kind: 'choice',
        choose: 1,
        pool: { source: 'filtered', armorCategory: 'heavy' },
      }),
    ).toBe('Character chooses 1 heavy armor.')
  })
})
