import { describe, expect, it } from 'vitest'

import { SPELL_REFERENCE_DISPLAY_MESSAGES, type Spell } from '@rpg/contracts'

import {
  buildSeedDamageTypeVocabulary,
  buildSeedLanguageVocabulary,
  buildSeedSenseVocabulary,
  getDamageTypeLabelFromVocabulary,
  getLanguageLabelFromVocabulary,
  getSenseLabelFromVocabulary,
} from '@/features/vocabulary'

import { GRANT_ROW_TYPE_LABELS } from './grant-form-schema'
import {
  buildGrantSpellReferencePresentationFromAuthoring,
  formatCompactMetadataList,
  formatGrantRowDisclosureAriaLabel,
  formatGrantRowToolbarAriaLabel,
  omitRedundantGrantDetail,
  resolveGrantRowPresentation,
  type GrantRowHeaderContext,
  type GrantRowPresentation,
} from './grant-row-presentation.lib'

function spellCatalog(entries: Array<{ id: string; name: string; status?: string }>) {
  return new Map(
    entries.map(
      (entry) =>
        [
          entry.id,
          {
            id: entry.id,
            name: entry.name,
            level: 1,
            status: entry.status ?? 'published',
          } as Spell,
        ] as const,
    ),
  )
}

const seedDamageTypes = buildSeedDamageTypeVocabulary()
const seedLanguages = buildSeedLanguageVocabulary()
const seedSenses = buildSeedSenseVocabulary()

const headerContext = {
  rowLabels: GRANT_ROW_TYPE_LABELS,
  resolveDamageTypeLabel: (id: string) => getDamageTypeLabelFromVocabulary(seedDamageTypes, id),
  resolveLanguageLabel: (id: string) => getLanguageLabelFromVocabulary(seedLanguages, id),
  resolveSenseLabel: (id: string) => getSenseLabelFromVocabulary(seedSenses, id),
  equipmentOptions: [],
  weaponOptions: [{ value: 'longsword', label: 'Longsword' }],
  toolOptions: [{ value: 'thieves-tools', label: "Thieves' Tools" }],
  armorOptions: [],
  skillOptions: [{ value: 'athletics', label: 'Athletics' }],
  spellReferences: buildGrantSpellReferencePresentationFromAuthoring({
    status: 'ready',
    spellsById: spellCatalog([
      { id: 'srd-cc-5.2.1:aid', name: 'Aid' },
      { id: 'srd-cc-5.2.1:animate-dead', name: 'Animate Dead' },
      { id: 'srd-cc-5.2.1:dancing-lights', name: 'Dancing Lights' },
    ]),
  }),
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

describe('grant spell reference presentation', () => {
  it('resolves display names from the authoritative catalog, not pickers', () => {
    const presentation = buildGrantSpellReferencePresentationFromAuthoring({
      status: 'ready',
      spellsById: spellCatalog([
        { id: 'srd-cc-5.2.1:draft-only', name: 'Draft Spell', status: 'draft' },
      ]),
    })
    expect(presentation.displayName('srd-cc-5.2.1:draft-only')).toBe('Draft Spell')
    expect(presentation.displayName('srd-cc-5.2.1:missing')).toBe(
      SPELL_REFERENCE_DISPLAY_MESSAGES.unknownSpell,
    )
  })

  it('does not fabricate names while the catalog is loading', () => {
    const presentation = buildGrantSpellReferencePresentationFromAuthoring({
      status: 'pending',
      spellsById: spellCatalog([{ id: 'srd-cc-5.2.1:aid', name: 'Aid' }]),
    })
    expect(presentation.displayName('srd-cc-5.2.1:aid')).toBe(
      SPELL_REFERENCE_DISPLAY_MESSAGES.catalogLoading,
    )
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
        spellUseLimit: 'at-will',
        spellIds: ['srd-cc-5.2.1:aid', 'srd-cc-5.2.1:animate-dead'],
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
