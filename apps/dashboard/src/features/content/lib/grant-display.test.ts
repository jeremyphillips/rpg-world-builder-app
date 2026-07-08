import { describe, expect, it } from 'vitest'

import type { GrantGroup, Spell } from '@rpg/contracts'

import {
  buildCatalogDrowGrantDisplayVocabulary,
  DROW_HERITAGE_GROUPED_SUMMARY_WITH_SUFFIX,
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
          grants: [
            { kind: 'sense', type: 'darkvision', range: 120 },
            { kind: 'resistances', damageTypes: ['fire'] },
          ],
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

  it('renders a total benefit count without "more" when only hidden known grants exist', () => {
    const model = buildGrantSummaryModel(
      [
        {
          grants: [
            { kind: 'resistances', damageTypes: ['fire'] },
            { kind: 'languages', languageIds: ['elvish'] },
          ],
        },
      ],
      vocabulary,
    )

    expect(formatGrantSummaryByLevel(model)).toEqual([{ label: 'L1', text: '2 benefits' }])
    expect(formatGrantSummaryInline(model)).toBe('2 benefits')
  })

  it('includes movement in visible grant summaries when mixed with hidden grants', () => {
    const model = buildGrantSummaryModel(
      [
        {
          grants: [
            { kind: 'sense', type: 'darkvision', range: 120 },
            movementGrant,
            { kind: 'resistances', damageTypes: ['fire'] },
          ],
        },
      ],
      vocabulary,
    )

    expect(formatGrantSummaryByLevel(model)).toEqual([
      {
        label: 'L1',
        text: `Darkvision 120 ft${GRANT_SUMMARY_JOIN}Walk speed +5 ft${GRANT_SUMMARY_JOIN}1 more benefit`,
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
          grants: [
            { kind: 'sense', type: 'darkvision', range: 120 },
            { kind: 'resistances', damageTypes: ['fire'] },
          ],
        },
      ],
      vocabulary,
    )

    expect(formatGrantSummaryByLevel(model, { exposeUnsupportedGrants: true })).toEqual([
      {
        label: 'L1',
        text: `Darkvision 120 ft${GRANT_SUMMARY_JOIN}Unsupported grant: resistances`,
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
