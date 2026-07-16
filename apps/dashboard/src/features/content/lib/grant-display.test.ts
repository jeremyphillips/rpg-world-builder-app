import { describe, expect, it } from 'vitest'

import type { GrantGroup, Spell } from '@rpg/contracts'

import {
  buildCatalogDrowGrantDisplayVocabulary,
  buildCatalogEquipmentGrantVocabulary,
  DROW_HERITAGE_GROUPED_SUMMARY_WITH_SUFFIX,
  getCatalogBlackDragonHeritageGrantGroups,
  getCatalogDruidDruidicGrantGroups,
  getCatalogDrowHeritageGrantGroups,
  getCatalogWoodElfHeritageGrantGroups,
} from './fixtures/grant-display-fixtures'
import {
  buildGrantSummaryModel,
  buildSpellGrantVocabulary,
  formatGrantSummaryByLevel,
  formatGrantSummaryInline,
  GRANT_SUMMARY_JOIN,
} from './grant-display'

const vocabulary = buildCatalogDrowGrantDisplayVocabulary()

const movementGrant = {
  kind: 'movement',
  mode: 'walk',
  operation: 'increase',
  feet: 5,
} as const satisfies GrantGroup['grants'][number]

const acidResistanceGrant = {
  kind: 'resistances',
  damageTypes: ['acid'],
} as const satisfies GrantGroup['grants'][number]

const hiddenFeatChoiceGrant = {
  kind: 'featChoice',
  category: 'general',
  choose: 1,
} as const satisfies GrantGroup['grants'][number]

const proficiencyVocabulary = {
  ...vocabulary,
  resolveToolName: (slug: string) => (slug === 'thieves-tools' ? "Thieves' Tools" : undefined),
}

const equipmentVocabulary = {
  ...vocabulary,
  ...buildCatalogEquipmentGrantVocabulary(),
}

const starterProficiencyGrants = [
  {
    kind: 'skillProficiency',
    grant: { kind: 'fixed', skillIds: ['athletics'] },
  },
  {
    kind: 'toolProficiency',
    grant: { kind: 'fixed', toolSlugs: ['thieves-tools'] },
  },
  {
    kind: 'weaponProficiency',
    grant: { kind: 'fixed', weaponCategories: ['simple'] },
  },
  {
    kind: 'armorTraining',
    grant: { kind: 'fixed', armorCategories: ['light'] },
  },
] as const satisfies GrantGroup['grants']

describe('buildGrantSummaryModel', () => {
  it('returns empty model for missing grant groups', () => {
    expect(buildGrantSummaryModel(undefined, vocabulary)).toEqual({
      groups: [],
      flatItems: [],
    })
  })

  it('groups catalog Drow heritage grants by effective unlock level', () => {
    const model = buildGrantSummaryModel(getCatalogDrowHeritageGrantGroups(), vocabulary)

    expect(model.groups.map((group) => group.level)).toEqual([1, 3, 5])
    expect(model.groups[0]?.label).toBe('L1')
    expect(model.groups[1]?.label).toBe('L3')
    expect(model.groups[2]?.label).toBe('L5')
    expect(model.flatItems).toHaveLength(4)
  })

  it('marks supported catalog Drow items with source grant kinds', () => {
    const model = buildGrantSummaryModel(getCatalogDrowHeritageGrantGroups(), vocabulary)

    expect(model.flatItems[0]).toMatchObject({
      kind: 'sense',
      supported: true,
      sourceGrantKind: 'sense',
      label: 'Darkvision 120 ft',
    })
    expect(model.flatItems[1]).toMatchObject({
      kind: 'cantrip',
      supported: true,
      sourceGrantKind: 'spells',
      label: 'Dancing Lights',
    })
    expect(model.flatItems[2]).toMatchObject({
      kind: 'spell',
      supported: true,
      sourceGrantKind: 'spells',
      label: 'Faerie Fire',
    })
  })

  it('renders movement grants with compact speed labels', () => {
    const model = buildGrantSummaryModel([{ grants: [movementGrant] }], vocabulary)

    expect(model.flatItems[0]).toMatchObject({
      kind: 'speed',
      supported: true,
      sourceGrantKind: 'movement',
      label: 'Walk speed +5 ft',
    })
    expect(model.notRenderedCount).toBeUndefined()
  })

  it('renders catalog Wood Elf heritage movement alongside spells', () => {
    const groups = getCatalogWoodElfHeritageGrantGroups()
    const model = buildGrantSummaryModel([groups[0]!], vocabulary)

    expect(model.flatItems[0]).toMatchObject({
      kind: 'speed',
      supported: true,
      label: 'Walk speed +5 ft',
    })
    expect(model.flatItems[1]).toMatchObject({
      kind: 'cantrip',
      supported: true,
      label: 'Druidcraft',
    })
    expect(formatGrantSummaryInline(model)).toBe(`Walk speed +5 ft${GRANT_SUMMARY_JOIN}Druidcraft`)
  })

  it('renders catalog Black Dragon heritage damage type and resistance grants', () => {
    const model = buildGrantSummaryModel(getCatalogBlackDragonHeritageGrantGroups(), vocabulary)

    expect(model.flatItems[0]).toMatchObject({
      kind: 'damageType',
      supported: true,
      sourceGrantKind: 'damageType',
      label: 'Acid damage type',
    })
    expect(model.flatItems[1]).toMatchObject({
      kind: 'resistance',
      supported: true,
      sourceGrantKind: 'resistances',
      label: 'Acid resistance',
    })
    expect(formatGrantSummaryInline(model)).toBe(
      `Acid damage type${GRANT_SUMMARY_JOIN}Acid resistance`,
    )
    expect(formatGrantSummaryByLevel(model)).toEqual([
      {
        label: 'L1',
        text: `Acid damage type${GRANT_SUMMARY_JOIN}Acid resistance`,
      },
    ])
  })

  it('renders language grants with compact labels', () => {
    const single = buildGrantSummaryModel(
      [{ grants: [{ kind: 'languages', languageIds: ['druidic'] }] }],
      vocabulary,
    )
    expect(single.flatItems[0]).toMatchObject({
      kind: 'language',
      supported: true,
      sourceGrantKind: 'languages',
      label: 'Druidic language',
    })

    const many = buildGrantSummaryModel(
      [{ grants: [{ kind: 'languages', languageIds: ['common', 'elvish'] }] }],
      vocabulary,
    )
    expect(many.flatItems[0]).toMatchObject({
      kind: 'language',
      label: 'Common, Elvish languages',
    })
  })

  it('renders catalog Druid Druidic language alongside prepared spells', () => {
    const groups = getCatalogDruidDruidicGrantGroups()
    const model = buildGrantSummaryModel([groups[0]!], vocabulary, { parentLevel: 1 })

    expect(model.flatItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'spell',
          supported: true,
          sourceGrantKind: 'spells',
        }),
        expect.objectContaining({
          kind: 'language',
          supported: true,
          sourceGrantKind: 'languages',
          label: 'Druidic language',
        }),
      ]),
    )
    expect(formatGrantSummaryInline(model)).toBe(
      `Speak with Animals${GRANT_SUMMARY_JOIN}Druidic language`,
    )
  })

  it('renders mixed fixed proficiency grants in one level group', () => {
    const model = buildGrantSummaryModel(
      [{ grants: [...starterProficiencyGrants] }],
      proficiencyVocabulary,
    )

    expect(model.flatItems.map((item) => item.label)).toEqual([
      'Athletics proficiency',
      "Thieves' Tools proficiency",
      'Simple weapons proficiency',
      'Light armor training',
    ])
    expect(formatGrantSummaryByLevel(model)).toEqual([
      {
        label: 'L1',
        text: [
          'Athletics proficiency',
          "Thieves' Tools proficiency",
          'Simple weapons proficiency',
          'Light armor training',
        ].join(GRANT_SUMMARY_JOIN),
      },
    ])
  })

  it('marks choice proficiency grants as not rendered yet', () => {
    const model = buildGrantSummaryModel(
      [
        {
          grants: [
            {
              kind: 'skillProficiency',
              grant: { kind: 'choice', choose: 2, pool: { source: 'any' } },
            },
          ],
        },
      ],
      vocabulary,
    )

    expect(model.flatItems[0]).toMatchObject({
      kind: 'notRenderedYet',
      supported: false,
      sourceGrantKind: 'skillProficiency',
    })
  })

  it('renders equipment grants with names and service suffixes', () => {
    const model = buildGrantSummaryModel(
      [
        {
          grants: [
            {
              kind: 'equipment',
              grant: { kind: 'grant', equipmentSlug: 'antitoxin', quantity: 1 },
            },
            {
              kind: 'equipment',
              grant: { kind: 'grant', equipmentSlug: 'camel', quantity: 1 },
            },
            {
              kind: 'equipment',
              grant: { kind: 'grant', equipmentSlug: 'wagon', quantity: 1 },
            },
            {
              kind: 'equipment',
              grant: { kind: 'grant', equipmentSlug: 'potion-of-healing', quantity: 1 },
            },
            {
              kind: 'equipment',
              grant: { kind: 'grant', equipmentSlug: 'messenger', quantity: 1 },
            },
          ],
        },
      ],
      equipmentVocabulary,
    )

    expect(model.flatItems.map((item) => item.label)).toEqual([
      'Antitoxin',
      'Camel',
      'Wagon',
      'Potion of Healing',
      'Messenger service',
    ])
    expect(formatGrantSummaryByLevel(model)).toEqual([
      {
        label: 'L1',
        text: ['Antitoxin', 'Camel', 'Wagon', 'Potion of Healing', 'Messenger service'].join(
          GRANT_SUMMARY_JOIN,
        ),
      },
    ])
  })

  it('marks unrecognized grant kinds separately from notRenderedYet', () => {
    const model = buildGrantSummaryModel(
      [{ grants: [{ kind: 'futureGrant' } as never] }],
      vocabulary,
    )

    expect(model.flatItems[0]).toMatchObject({
      kind: 'unrecognized',
      supported: false,
      sourceGrantKind: 'futureGrant',
      label: '',
    })
  })
})

describe('formatGrantSummaryInline', () => {
  it('joins supported flat items with the summary separator', () => {
    const model = buildGrantSummaryModel(getCatalogDrowHeritageGrantGroups(), vocabulary)

    expect(formatGrantSummaryInline(model)).toBe(
      ['Darkvision 120 ft', 'Dancing Lights', 'Faerie Fire', 'Darkness'].join(GRANT_SUMMARY_JOIN),
    )
  })

  it('can include spell type suffixes', () => {
    const model = buildGrantSummaryModel(getCatalogDrowHeritageGrantGroups(), vocabulary)

    expect(formatGrantSummaryInline(model, { includeTypeSuffix: true })).toBe(
      ['Darkvision 120 ft', 'Dancing Lights cantrip', 'Faerie Fire spell', 'Darkness spell'].join(
        GRANT_SUMMARY_JOIN,
      ),
    )
  })

  it('truncates with +N more when maxItems is exceeded', () => {
    const model = buildGrantSummaryModel(getCatalogDrowHeritageGrantGroups(), vocabulary)

    expect(formatGrantSummaryInline(model, { maxItems: 2 })).toBe(
      `Darkvision 120 ft${GRANT_SUMMARY_JOIN}Dancing Lights${GRANT_SUMMARY_JOIN}+2 more`,
    )
  })

  it('collapses not-rendered grants into N more benefit when mixed with supported items', () => {
    const model = buildGrantSummaryModel(
      [
        {
          grants: [{ kind: 'sense', type: 'darkvision', range: 120 }, hiddenFeatChoiceGrant],
        },
      ],
      vocabulary,
    )

    expect(formatGrantSummaryInline(model)).toBe(
      `Darkvision 120 ft${GRANT_SUMMARY_JOIN}1 more benefit`,
    )
  })
})

describe('formatGrantSummaryByLevel', () => {
  it('renders grouped L1, L3, and L5 summaries for catalog Drow', () => {
    const model = buildGrantSummaryModel(getCatalogDrowHeritageGrantGroups(), vocabulary)

    expect(formatGrantSummaryByLevel(model, { includeTypeSuffix: true })).toEqual([
      ...DROW_HERITAGE_GROUPED_SUMMARY_WITH_SUFFIX,
    ])
  })

  it('renders language grants directly when they are the only grants', () => {
    const model = buildGrantSummaryModel(
      [
        {
          grants: [{ kind: 'languages', languageIds: ['elvish'] }],
        },
      ],
      vocabulary,
    )

    expect(formatGrantSummaryByLevel(model)).toEqual([{ label: 'L1', text: 'Elvish language' }])
    expect(formatGrantSummaryInline(model)).toBe('Elvish language')
  })

  it('renders a total benefit count without "more" when only hidden known grants exist', () => {
    const model = buildGrantSummaryModel([{ grants: [hiddenFeatChoiceGrant] }], vocabulary)

    expect(formatGrantSummaryByLevel(model)).toEqual([{ label: 'L1', text: '1 benefit' }])
    expect(formatGrantSummaryInline(model)).toBe('1 benefit')
  })

  it('includes movement, resistance, and language in visible grant summaries when mixed with hidden grants', () => {
    const model = buildGrantSummaryModel(
      [
        {
          grants: [
            { kind: 'sense', type: 'darkvision', range: 120 },
            movementGrant,
            acidResistanceGrant,
            { kind: 'languages', languageIds: ['elvish'] },
            hiddenFeatChoiceGrant,
          ],
        },
      ],
      vocabulary,
    )

    expect(formatGrantSummaryByLevel(model)).toEqual([
      {
        label: 'L1',
        text: `Darkvision 120 ft${GRANT_SUMMARY_JOIN}Walk speed +5 ft${GRANT_SUMMARY_JOIN}Acid resistance${GRANT_SUMMARY_JOIN}Elvish language${GRANT_SUMMARY_JOIN}1 more benefit`,
      },
    ])
  })

  it('omits level summary when only unrecognized grants exist', () => {
    const model = buildGrantSummaryModel(
      [{ grants: [{ kind: 'futureGrant' } as never] }],
      vocabulary,
    )

    expect(formatGrantSummaryByLevel(model)).toEqual([])
    expect(formatGrantSummaryInline(model)).toBe('')
  })

  it('does not count unrecognized grants toward hidden overflow benefits', () => {
    const model = buildGrantSummaryModel(
      [
        {
          grants: [
            { kind: 'sense', type: 'darkvision', range: 120 },
            movementGrant,
            { kind: 'futureGrant' } as never,
          ],
        },
      ],
      vocabulary,
    )

    expect(formatGrantSummaryByLevel(model)).toEqual([
      {
        label: 'L1',
        text: `Darkvision 120 ft${GRANT_SUMMARY_JOIN}Walk speed +5 ft`,
      },
    ])
  })

  it('exposes unsupported grant kinds in dev/test mode', () => {
    const model = buildGrantSummaryModel(
      [
        {
          grants: [{ kind: 'sense', type: 'darkvision', range: 120 }, hiddenFeatChoiceGrant],
        },
      ],
      vocabulary,
    )

    expect(formatGrantSummaryByLevel(model, { exposeUnsupportedGrants: true })).toEqual([
      {
        label: 'L1',
        text: `Darkvision 120 ft${GRANT_SUMMARY_JOIN}Unsupported grant: featChoice`,
      },
    ])
  })
})

describe('buildSpellGrantVocabulary', () => {
  it('resolves spell display metadata by slug', () => {
    const resolveSpell = buildSpellGrantVocabulary([
      {
        id: 'ruleset:dancing-lights',
        slug: 'dancing-lights',
        name: 'Dancing Lights',
        level: 0,
      } as Spell,
    ])

    expect(resolveSpell('dancing-lights')).toEqual({ name: 'Dancing Lights', level: 0 })
    expect(resolveSpell('missing')).toBeUndefined()
  })
})
