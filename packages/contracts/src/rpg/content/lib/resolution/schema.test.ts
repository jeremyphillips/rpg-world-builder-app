import { describe, expect, it } from 'vitest'

import { monsterActionDraftSchema, monsterActionSchema } from '../../monster/action/index'
import { BURNING_HANDS_RESOLUTION, CURE_WOUNDS_RESOLUTION } from '../../spell/resolution/fixtures'
import { CONE_AREA } from '../../monster/test-fixtures'
import { RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, effectResolutionSchema } from './schema'

describe('effectResolutionSchema', () => {
  it('accepts a saving-throw area resolution without spell progression', () => {
    const {
      applicationPattern: _pattern,
      progression: _progression,
      ...envelope
    } = BURNING_HANDS_RESOLUTION
    expect(effectResolutionSchema.parse(envelope)).toEqual(envelope)
  })

  it('defaults omitted target count kind from the count', () => {
    const {
      applicationPattern: _pattern,
      progression: _progression,
      ...envelope
    } = CURE_WOUNDS_RESOLUTION
    if (!envelope.target) throw new Error('fixture target missing')
    const { countKind: _countKind, ...target } = envelope.target
    const parsed = effectResolutionSchema.parse({ ...envelope, target })
    expect(parsed.target?.countKind).toBe('exact')
  })

  it('rejects spell-only attack methods, projectiles, and progression', () => {
    const {
      applicationPattern: _pattern,
      progression: _progression,
      ...envelope
    } = BURNING_HANDS_RESOLUTION

    expect(
      effectResolutionSchema.safeParse({
        ...envelope,
        method: { kind: 'attack', attackType: 'ranged-spell' },
      }).success,
    ).toBe(false)
    expect(
      effectResolutionSchema.safeParse({
        ...envelope,
        applicationPattern: {
          kind: 'projectiles',
          count: { type: 'fixed', value: 1 },
          applicationMode: 'per-projectile',
        },
      }).success,
    ).toBe(false)
    expect(
      effectResolutionSchema.safeParse({
        ...envelope,
        progression: { basis: 'spell-slot-level', tracks: [] },
      }).success,
    ).toBe(false)
  })

  it('accepts condition-only saves with ordered outcome effects', () => {
    const parsed = effectResolutionSchema.parse({
      selectionMode: 'targets',
      target: {
        count: 1,
        kind: 'creature',
        proximity: { kind: 'distance', distance: { value: 60, unit: 'ft' } },
      },
      method: { kind: 'saving-throw', ability: 'wis' },
      effects: [],
      outcomes: [
        {
          result: 'failed-save',
          applications: [],
          effects: [
            {
              kind: 'condition',
              conditionId: 'unconscious',
              end: { kind: 'turn-bound', participant: 'target', boundary: 'end', which: 'next' },
            },
          ],
        },
        { result: 'successful-save', applications: [] },
      ],
    })
    expect(parsed.effects).toEqual([])
    expect(parsed.outcomes[0]?.effects).toHaveLength(1)
  })

  it('rejects duplicate envelope and outcome damage on the same save branch', () => {
    const {
      applicationPattern: _pattern,
      progression: _progression,
      ...envelope
    } = BURNING_HANDS_RESOLUTION
    expect(
      effectResolutionSchema.safeParse({
        ...envelope,
        outcomes: [
          {
            result: 'failed-save',
            applications: [{ effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
            effects: [
              {
                kind: 'damage',
                roll: { dice: { count: 1, faces: 6 } },
                damageType: 'fire',
              },
            ],
          },
          {
            result: 'successful-save',
            applications: [{ effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'half' }],
          },
        ],
      }).success,
    ).toBe(false)
  })

  it('allows failed-or-successful-save notes without applications', () => {
    const {
      applicationPattern: _pattern,
      progression: _progression,
      ...envelope
    } = BURNING_HANDS_RESOLUTION
    const parsed = effectResolutionSchema.parse({
      ...envelope,
      outcomes: [
        ...envelope.outcomes,
        {
          result: 'failed-or-successful-save',
          applications: [],
          note: 'Being underwater does not grant resistance to this fire damage.',
        },
      ],
    })
    expect(parsed.outcomes.some((outcome) => outcome.result === 'failed-or-successful-save')).toBe(
      true,
    )
  })

  it('rejects publish saves with incomplete repeat save second failure', () => {
    expect(
      monsterActionSchema.safeParse({
        id: 'sleep-breath',
        kind: 'save',
        name: 'Sleep Breath',
        dcSource: { kind: 'ability', ability: 'con', proficient: true },
        resolution: {
          selectionMode: 'self',
          areaOfEffect: CONE_AREA,
          method: { kind: 'saving-throw', ability: 'con' },
          effects: [],
          outcomes: [
            {
              result: 'failed-save',
              applications: [],
              effects: [{ kind: 'condition', conditionId: 'unconscious' }],
              repeatSave: {
                timing: { participant: 'target', boundary: 'end', which: 'next' },
                secondFailure: {},
              },
            },
            { result: 'successful-save', applications: [] },
          ],
        },
      }).success,
    ).toBe(false)
  })

  it('allows draft saves with incomplete repeat save until normalization', () => {
    const parsed = monsterActionDraftSchema.parse({
      id: 'sleep-breath',
      kind: 'save',
      name: 'Sleep Breath',
      dcSource: { kind: 'ability', ability: 'con', proficient: true },
      resolution: {
        selectionMode: 'self',
        areaOfEffect: CONE_AREA,
        method: { kind: 'saving-throw', ability: 'con' },
        effects: [],
        outcomes: [
          {
            result: 'failed-save',
            applications: [],
            effects: [{ kind: 'condition', conditionId: 'unconscious' }],
            repeatSave: {
              timing: { participant: 'target', boundary: 'end', which: 'next' },
              secondFailure: {},
            },
          },
          { result: 'successful-save', applications: [] },
        ],
      },
    })
    expect(parsed.kind).toBe('save')
  })
})
