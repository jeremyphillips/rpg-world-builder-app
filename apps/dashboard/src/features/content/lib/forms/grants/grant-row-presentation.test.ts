import { describe, expect, it } from 'vitest'

import {
  EQUIPMENT_REFERENCE_DISPLAY_MESSAGES,
  SPELL_REFERENCE_DISPLAY_MESSAGES,
  type Equipment,
  type Spell,
} from '@rpg/contracts'

import {
  buildSeedDamageTypeVocabulary,
  buildSeedLanguageVocabulary,
  buildSeedSenseVocabulary,
} from '@/features/vocabulary'

import { GRANT_ROW_TYPE_LABELS } from './grant-form-schema'
import {
  buildGrantEquipmentReferencePresentationFromAuthoring,
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

const testEquipmentScope = { rulesetId: 'srd-cc-5.2.1', campaignId: 'campaign-1' }

function equipmentCatalog(
  entries: Array<{ id: string; slug: string; name: string; status?: string }>,
): ReadonlyMap<string, Equipment> {
  return new Map(
    entries.map(
      (entry) =>
        [
          entry.id,
          {
            id: entry.id,
            slug: entry.slug,
            name: entry.name,
            rulesetId: testEquipmentScope.rulesetId,
            catalogLayer: 'system',
            campaignId: null,
            status: entry.status ?? 'published',
          } as Equipment,
        ] as const,
    ),
  )
}

const headerContext = {
  rowLabels: GRANT_ROW_TYPE_LABELS,
  resolveDamageTypeLabel: (id: string) => seedDamageTypes.labelById[id],
  resolveLanguageLabel: (id: string) => seedLanguages.labelById[id],
  resolveSenseLabel: (id: string) => seedSenses.labelById[id],
  equipmentReferences: buildGrantEquipmentReferencePresentationFromAuthoring({
    status: 'ready',
    scope: testEquipmentScope,
    equipmentById: equipmentCatalog([
      { id: 'srd-cc-5.2.1:longsword', slug: 'longsword', name: 'Longsword' },
      { id: 'srd-cc-5.2.1:dagger', slug: 'dagger', name: 'Dagger', status: 'draft' },
    ]),
  }),
  resolveSkillName: (slug: string) =>
    slug === 'athletics' ? 'Athletics' : 'Skill proficiency reference unavailable',
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
  it('scenario F: removed option-based spell grant name resolver', async () => {
    const exports = await import('./grant-form-fields')
    expect('resolveSpellGrantName' in exports).toBe(false)
  })
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

describe('grant equipment reference presentation', () => {
  it('resolves display names from the authoritative catalog, not pickers', () => {
    const presentation = buildGrantEquipmentReferencePresentationFromAuthoring({
      status: 'ready',
      scope: testEquipmentScope,
      equipmentById: equipmentCatalog([
        { id: 'srd-cc-5.2.1:dagger', slug: 'dagger', name: 'Dagger', status: 'draft' },
      ]),
    })
    expect(presentation.displayName('dagger')).toBe('Dagger')
    expect(presentation.displayName('missing-slug')).toBe(
      EQUIPMENT_REFERENCE_DISPLAY_MESSAGES.unknownEquipment,
    )
  })

  it('does not fabricate names while the catalog is loading', () => {
    const presentation = buildGrantEquipmentReferencePresentationFromAuthoring({
      status: 'pending',
      scope: testEquipmentScope,
      equipmentById: equipmentCatalog([
        { id: 'srd-cc-5.2.1:longsword', slug: 'longsword', name: 'Longsword' },
      ]),
    })
    expect(presentation.displayName('longsword')).toBe(
      EQUIPMENT_REFERENCE_DISPLAY_MESSAGES.catalogLoading,
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
      values: { grantType: 'featChoice', featCategory: 'fighting-style', featChoose: '1' },
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
    {
      name: 'equipment grant',
      values: {
        grantType: 'equipment',
        itemKind: 'grant',
        grantTargetSource: 'equipment',
        equipmentSlug: 'dagger',
        quantity: 1,
      },
      expected: {
        heading: 'Equipment',
        descriptionIncludes: 'dagger',
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

  it('resolves persisted equipment proficiencies independently of picker eligibility', () => {
    const presentation = resolveGrantRowPresentation(
      {
        grantType: 'weaponProficiency',
        proficiencySource: 'specific',
        weaponProficiencySlugs: ['dagger', 'missing-weapon'],
      },
      headerContext,
    )
    expect(presentation?.detail).toBe('Dagger, Equipment reference unavailable')
    expect(presentation?.description).toBe(
      'Character gains proficiency with Dagger and Equipment reference unavailable.',
    )
  })

  it.each([
    ['damageType', 'Character chooses from grave frost damage.'],
    ['resistances', 'Character gains Resistance to grave frost damage.'],
  ])(
    'uses campaign damage labels for %s and reports missing references',
    (grantType, description) => {
      const context = {
        ...headerContext,
        resolveDamageTypeLabel: (id: string) => (id === 'cold' ? 'Grave Frost' : undefined),
      }
      expect(
        resolveGrantRowPresentation({ grantType, [grantType]: ['cold'] }, context),
      ).toMatchObject({ detail: 'Grave Frost', description })
      const mixed = resolveGrantRowPresentation(
        { grantType, [grantType]: ['cold', 'missing-damage'] },
        context,
      )
      expect(mixed?.detail).toBe('Grave Frost, Damage Type reference unavailable')
      expect(mixed?.description).toBeUndefined()
    },
  )

  it('uses campaign language and sense labels in details and descriptions', () => {
    const context = {
      ...headerContext,
      resolveLanguageLabel: () => 'River Cant',
      resolveSenseLabel: () => 'Moon Sight',
    }
    expect(
      resolveGrantRowPresentation({ grantType: 'languages', language: 'river-cant' }, context),
    ).toMatchObject({ detail: 'River Cant', description: 'Character knows River Cant.' })
    expect(
      resolveGrantRowPresentation(
        { grantType: 'senses', senseType: 'moon-sight', senseRange: '60' },
        context,
      ),
    ).toMatchObject({
      detail: 'Moon Sight 60 ft.',
      description: 'Character gains Moon Sight with a range of 60 feet.',
    })
  })

  it('displays unavailable copy for missing language and sense references', () => {
    expect(
      resolveGrantRowPresentation(
        { grantType: 'languages', language: 'missing-language' },
        headerContext,
      ),
    ).toEqual({ heading: 'Language', detail: 'Language reference unavailable' })
    const sense = resolveGrantRowPresentation(
      { grantType: 'senses', senseType: 'missing-sense', senseRange: 60 },
      headerContext,
    )
    expect(sense?.detail).toBe('Sense reference unavailable')
    expect(sense?.description).toBeUndefined()
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
