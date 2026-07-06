import { describe, expect, it } from 'vitest'

import {
  isMeaningfulProficiencyChoice,
  proficiencyChoiceGroupSchema,
  proficiencyGrantSetSchema,
  skillProficiencyChoiceGroupSchema,
} from './proficiency-grant-set'

describe('proficiencyGrantSetSchema', () => {
  it('defaults empty categories and items', () => {
    expect(proficiencyGrantSetSchema.parse({})).toEqual({
      categories: [],
      items: [],
    })
  })

  it('parses populated grant sets', () => {
    expect(
      proficiencyGrantSetSchema.parse({
        categories: ['light'],
        items: ['thieves-tools'],
      }),
    ).toEqual({
      categories: ['light'],
      items: ['thieves-tools'],
    })
  })
})

describe('isMeaningfulProficiencyChoice', () => {
  it('is true when choose and from are both non-empty', () => {
    expect(
      isMeaningfulProficiencyChoice({
        id: 'class-skills',
        choose: 2,
        from: ['athletics'],
      }),
    ).toBe(true)
  })

  it('is false for placeholder rows', () => {
    expect(
      isMeaningfulProficiencyChoice({
        id: 'class-skills',
        choose: 0,
        from: [],
      }),
    ).toBe(false)
    expect(
      isMeaningfulProficiencyChoice({
        id: 'class-skills',
        choose: 2,
        from: [],
      }),
    ).toBe(false)
  })
})

describe('proficiencyChoiceGroupSchema', () => {
  it('accepts a group with one meaningful choice', () => {
    expect(
      proficiencyChoiceGroupSchema.safeParse({
        choices: [{ id: 'class-skills', choose: 2, from: ['athletics', 'stealth'] }],
      }).success,
    ).toBe(true)
  })

  it('rejects empty choices array', () => {
    expect(proficiencyChoiceGroupSchema.safeParse({ choices: [] }).success).toBe(false)
  })

  it('rejects groups with only placeholder rows', () => {
    expect(
      proficiencyChoiceGroupSchema.safeParse({
        choices: [{ id: 'class-skills', choose: 0, from: [] }],
      }).success,
    ).toBe(false)
  })
})

describe('skillProficiencyChoiceGroupSchema', () => {
  it('validates skill slugs in from', () => {
    expect(
      skillProficiencyChoiceGroupSchema.safeParse({
        choices: [{ id: 'class-skills', choose: 1, from: ['Animal Handling'] }],
      }).success,
    ).toBe(false)
  })
})
