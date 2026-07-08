import { describe, expect, it } from 'vitest'

import type { GrantGroup, Spell } from '@rpg/contracts'

import {
  buildGrantSummaryModel,
  buildSpellGrantVocabulary,
  formatGrantSummaryByLevel,
  formatGrantSummaryInline,
  GRANT_SUMMARY_JOIN,
  type GrantDisplayVocabulary,
} from './grant-display'

const vocabulary: GrantDisplayVocabulary = {
  resolveSenseLabel: (type) => (type === 'darkvision' ? 'Darkvision' : type),
  resolveSpell: (slug) => {
    const spells: Record<string, { name: string; level: number }> = {
      'dancing-lights': { name: 'Dancing Lights', level: 0 },
      'faerie-fire': { name: 'Faerie Fire', level: 1 },
      darkness: { name: 'Darkness', level: 2 },
    }
    return spells[slug]
  },
}

const movementGrant = {
  kind: 'movement',
  mode: 'walk',
  operation: 'bonus',
  value: 5,
  unit: 'ft',
} as const satisfies GrantGroup['grants'][number]

const drowGrantGroups = [
  {
    grants: [
      { kind: 'sense', type: 'darkvision', range: 120 },
      {
        kind: 'spells',
        ability: 'cha',
        mode: 'free_cast',
        spellIds: ['dancing-lights'],
        frequency: 'at_will',
      },
    ],
  },
  {
    unlock: { level: 3 },
    grants: [
      {
        kind: 'spells',
        ability: 'cha',
        mode: 'free_cast',
        spellIds: ['faerie-fire'],
        frequency: 'once_per_long_rest',
      },
    ],
  },
  {
    unlock: { level: 5 },
    grants: [
      {
        kind: 'spells',
        ability: 'cha',
        mode: 'free_cast',
        spellIds: ['darkness'],
        frequency: 'once_per_long_rest',
      },
    ],
  },
] as const satisfies readonly GrantGroup[]

describe('buildGrantSummaryModel', () => {
  it('returns empty model for missing grant groups', () => {
    expect(buildGrantSummaryModel(undefined, vocabulary)).toEqual({
      groups: [],
      flatItems: [],
    })
  })

  it('groups Drow heritage grants by effective unlock level', () => {
    const model = buildGrantSummaryModel([...drowGrantGroups], vocabulary)

    expect(model.groups.map((group) => group.level)).toEqual([1, 3, 5])
    expect(model.groups[0]?.label).toBe('L1')
    expect(model.groups[1]?.label).toBe('L3')
    expect(model.groups[2]?.label).toBe('L5')
    expect(model.flatItems).toHaveLength(4)
  })

  it('marks known grant kinds without compact renderers as notRenderedYet', () => {
    const model = buildGrantSummaryModel([{ grants: [movementGrant] }], vocabulary)

    expect(model.flatItems[0]).toMatchObject({
      kind: 'notRenderedYet',
      supported: false,
      sourceGrantKind: 'movement',
      label: '',
    })
    expect(model.notRenderedCount).toBe(1)
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
    const model = buildGrantSummaryModel([...drowGrantGroups], vocabulary)

    expect(formatGrantSummaryInline(model)).toBe(
      ['Darkvision 120 ft', 'Dancing Lights', 'Faerie Fire', 'Darkness'].join(GRANT_SUMMARY_JOIN),
    )
  })

  it('can include spell type suffixes', () => {
    const model = buildGrantSummaryModel([...drowGrantGroups], vocabulary)

    expect(formatGrantSummaryInline(model, { includeTypeSuffix: true })).toBe(
      ['Darkvision 120 ft', 'Dancing Lights cantrip', 'Faerie Fire spell', 'Darkness spell'].join(
        GRANT_SUMMARY_JOIN,
      ),
    )
  })

  it('truncates with +N more when maxItems is exceeded', () => {
    const model = buildGrantSummaryModel([...drowGrantGroups], vocabulary)

    expect(formatGrantSummaryInline(model, { maxItems: 2 })).toBe(
      `Darkvision 120 ft${GRANT_SUMMARY_JOIN}Dancing Lights${GRANT_SUMMARY_JOIN}+2 more`,
    )
  })

  it('collapses not-rendered grants into N more benefit when mixed with supported items', () => {
    const model = buildGrantSummaryModel(
      [
        {
          grants: [{ kind: 'sense', type: 'darkvision', range: 120 }, movementGrant],
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
  it('renders grouped L1, L3, and L5 summaries for Drow', () => {
    const model = buildGrantSummaryModel([...drowGrantGroups], vocabulary)

    expect(formatGrantSummaryByLevel(model, { includeTypeSuffix: true })).toEqual([
      {
        label: 'L1',
        text: `Darkvision 120 ft${GRANT_SUMMARY_JOIN}Dancing Lights cantrip`,
      },
      {
        label: 'L3',
        text: 'Faerie Fire spell',
      },
      {
        label: 'L5',
        text: 'Darkness spell',
      },
    ])
  })

  it('uses Additional benefit only for a sole unrecognized grant', () => {
    const model = buildGrantSummaryModel(
      [{ grants: [{ kind: 'futureGrant' } as never] }],
      vocabulary,
    )

    expect(formatGrantSummaryByLevel(model)).toEqual([{ label: 'L1', text: 'Additional benefit' }])
  })

  it('exposes unsupported grant kinds in dev/test mode', () => {
    const model = buildGrantSummaryModel(
      [
        {
          grants: [{ kind: 'sense', type: 'darkvision', range: 120 }, movementGrant],
        },
      ],
      vocabulary,
    )

    expect(formatGrantSummaryByLevel(model, { exposeUnsupportedGrants: true })).toEqual([
      {
        label: 'L1',
        text: `Darkvision 120 ft${GRANT_SUMMARY_JOIN}Unsupported grant: movement`,
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
