import { describe, expect, it } from 'vitest'

import { GRANT_ROW_TYPE_LABELS } from './grant-form-schema'
import {
  formatCompactMetadataList,
  formatGrantRowDisclosureAriaLabel,
  formatGrantRowToolbarAriaLabel,
  omitRedundantGrantDetail,
  resolveGrantRowPresentation,
  resolveSpellGrantName,
  type GrantRowHeaderContext,
  type GrantRowPresentation,
} from './grant-row-presentation.lib'

const headerContext = {
  rowLabels: GRANT_ROW_TYPE_LABELS,
  equipmentOptions: [],
  weaponOptions: [{ value: 'longsword', label: 'Longsword' }],
  toolOptions: [{ value: 'thieves-tools', label: "Thieves' Tools" }],
  armorOptions: [],
  skillOptions: [{ value: 'athletics', label: 'Athletics' }],
  spellOptions: [
    { value: 'aid', label: 'Aid' },
    { value: 'animate-dead', label: 'Animate Dead' },
    { value: 'dancing-lights', label: 'Dancing Lights' },
  ],
} satisfies GrantRowHeaderContext

function assertGrantRowPresentation(presentation: GrantRowPresentation | undefined) {
  expect(presentation).toBeDefined()
  if (!presentation) return

  const { heading, detail, description } = presentation
  if (detail) {
    expect(omitRedundantGrantDetail(heading, detail)).toBe(detail)
    expect(detail.toLowerCase()).not.toBe(heading.toLowerCase())
    expect(detail.startsWith(`${heading} —`)).toBe(false)
    expect(detail.startsWith(`${heading} ·`)).toBe(false)
  }
  if (detail && description) {
    expect(detail).not.toBe(description)
  }
}

describe('formatCompactMetadataList', () => {
  it('uses comma-only compact metadata', () => {
    expect(formatCompactMetadataList(['Aid'])).toBe('Aid')
    expect(formatCompactMetadataList(['Aid', 'Animate Dead'])).toBe('Aid, Animate Dead')
    expect(formatCompactMetadataList(['Aid', 'Animate Dead', 'Light'])).toBe('Aid, Animate Dead +1')
  })
})

describe('resolveSpellGrantName', () => {
  it('returns catalog proper names and title-case slug fallback', () => {
    expect(resolveSpellGrantName('animate-dead', headerContext.spellOptions)).toBe('Animate Dead')
    expect(resolveSpellGrantName('unknown-spell', [])).toBe('Unknown Spell')
  })
})

describe('resolveGrantRowPresentation', () => {
  it.each([
    {
      name: 'armor training category',
      values: {
        grantType: 'armorTraining',
        proficiencySource: 'category',
        armorTrainingCategories: ['medium'],
      },
      expected: {
        heading: 'Armor training',
        detail: 'Medium armor',
      },
    },
    {
      name: 'tool proficiency category',
      values: {
        grantType: 'toolProficiency',
        proficiencySource: 'category',
        toolProficiencyCategories: ['gaming_set'],
      },
      expected: {
        heading: 'Tool proficiency',
        detail: 'Gaming set',
      },
    },
    {
      name: 'movement increase',
      values: {
        grantType: 'movement',
        movementMode: 'walk',
        movementOperation: 'increase',
        movementFeet: '5',
      },
      expected: {
        heading: 'Movement',
        detail: 'Walk +5 ft',
      },
    },
    {
      name: 'language',
      values: { grantType: 'languages', language: 'giant' },
      expected: {
        heading: 'Language',
        detail: 'Giant',
      },
    },
    {
      name: 'feat choice',
      values: { grantType: 'featChoice', featCategory: 'fighting-style', featChoose: 1 },
      expected: {
        heading: 'Feat choice',
        detail: '1 fighting style feat',
      },
    },
    {
      name: 'spells',
      values: {
        grantType: 'spells',
        spellAbility: 'cha',
        spellCastingEnabled: true,
        spellCastingFrequency: 'at_will',
        spellIds: ['aid', 'animate-dead'],
      },
      expected: {
        heading: 'Spells',
        detail: 'Aid, Animate Dead',
        descriptionIncludes: 'Animate Dead',
      },
    },
    {
      name: 'weapon proficiency category',
      values: {
        grantType: 'weaponProficiency',
        proficiencySource: 'category',
        weaponProficiencyCategories: ['simple'],
      },
      expected: {
        heading: 'Weapon proficiency',
        detail: 'Simple weapons',
      },
    },
    {
      name: 'damage resistance',
      values: { grantType: 'resistances', resistances: ['cold'] },
      expected: {
        heading: 'Damage resistance',
        detail: 'Cold',
      },
    },
  ])('$name', ({ values, expected }) => {
    const presentation = resolveGrantRowPresentation(values, headerContext)
    assertGrantRowPresentation(presentation)
    expect(presentation?.heading).toBe(expected.heading)
    expect(presentation?.detail).toBe(expected.detail)
    if ('descriptionIncludes' in expected && expected.descriptionIncludes) {
      expect(presentation?.description).toContain(expected.descriptionIncludes)
      expect(presentation?.description).not.toContain('animate-dead')
    }
  })

  it('omits detail when incomplete', () => {
    expect(
      resolveGrantRowPresentation({ grantType: 'languages' }, headerContext)?.detail,
    ).toBeUndefined()
    expect(
      resolveGrantRowPresentation({ grantType: 'movement' }, headerContext)?.detail,
    ).toBeUndefined()
  })

  it('returns repair heading when grant type is missing', () => {
    expect(resolveGrantRowPresentation({}, headerContext)).toEqual({
      heading: 'Grant type missing',
    })
  })
})

describe('formatGrantRowToolbarAriaLabel', () => {
  it('uses comma-separated assistive labels without section legend', () => {
    expect(formatGrantRowToolbarAriaLabel({ heading: 'Spells', detail: 'Aid, Animate Dead' })).toBe(
      'Spells, Aid, Animate Dead',
    )
    expect(
      formatGrantRowDisclosureAriaLabel(
        { heading: 'Spells', detail: 'Aid, Animate Dead' },
        'Expand',
      ),
    ).toBe('Expand Spells, Aid, Animate Dead')
  })
})
