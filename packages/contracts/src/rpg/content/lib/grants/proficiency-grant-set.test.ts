import { describe, expect, it } from 'vitest'

import {
  isMeaningfulLanguageProficiencyChoice,
  isMeaningfulProficiencyChoice,
  languageProficiencyChoiceSchema,
  languageProficiencyGrantSetSchema,
  proficiencyChoiceGroupSchema,
  proficiencyGrantSetSchema,
  skillProficiencyChoiceGroupSchema,
  toolProficiencyChoiceGroupSchema,
  toolProficiencyChoiceSchema,
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

describe('languageProficiencyGrantSetSchema', () => {
  it('defaults empty categories and items', () => {
    expect(languageProficiencyGrantSetSchema.parse({})).toEqual({
      categories: [],
      items: [],
    })
  })

  it('parses automatic language grants', () => {
    expect(
      languageProficiencyGrantSetSchema.parse({
        items: ['common'],
        categories: [],
      }),
    ).toEqual({
      items: ['common'],
      categories: [],
    })
  })
})

describe('languageProficiencyChoiceSchema', () => {
  it('parses category-filtered origin language choices', () => {
    expect(
      languageProficiencyChoiceSchema.parse({
        id: 'origin-languages',
        choose: 2,
        categories: ['standard'],
      }),
    ).toEqual({
      id: 'origin-languages',
      choose: 2,
      categories: ['standard'],
      from: [],
    })
  })

  it('parses explicit language pools', () => {
    expect(
      languageProficiencyChoiceSchema.parse({
        id: 'bonus-language',
        choose: 1,
        from: ['draconic'],
      }),
    ).toEqual({
      id: 'bonus-language',
      choose: 1,
      from: ['draconic'],
      categories: [],
    })
  })
})

describe('toolProficiencyChoiceSchema', () => {
  it('normalizes legacy from slugs to explicit pool', () => {
    expect(
      toolProficiencyChoiceSchema.parse({
        id: 'class-tools',
        choose: 3,
        from: ['lute', 'flute'],
      }),
    ).toEqual({
      id: 'class-tools',
      choose: 3,
      pool: { source: 'explicit', toolSlugs: ['lute', 'flute'] },
    })
  })

  it('accepts filtered pool choices', () => {
    expect(
      toolProficiencyChoiceGroupSchema.safeParse({
        choices: [
          {
            id: 'class-tools',
            choose: 3,
            pool: { source: 'filtered', toolCategories: ['musical_instrument'] },
          },
        ],
      }).success,
    ).toBe(true)
  })
})

describe('isMeaningfulLanguageProficiencyChoice', () => {
  it('is true when choose and categories are both non-empty', () => {
    expect(
      isMeaningfulLanguageProficiencyChoice({
        id: 'origin-languages',
        choose: 2,
        categories: ['standard'],
        from: [],
      }),
    ).toBe(true)
  })

  it('is false for placeholder rows', () => {
    expect(
      isMeaningfulLanguageProficiencyChoice({
        id: 'origin-languages',
        choose: 0,
        categories: [],
        from: [],
      }),
    ).toBe(false)
  })
})
