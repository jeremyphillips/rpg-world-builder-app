import { describe, expect, it } from 'vitest'

import type { MonsterAction } from '../../content/monster/action/index'

import {
  multiattackIfAvailableSuffix,
  multiattackReferenceHasUsageRestriction,
} from './multiattack-if-available'

describe('multiattackReferenceHasUsageRestriction', () => {
  it('detects action-level limited use', () => {
    const action = {
      id: 'roar',
      kind: 'special',
      name: 'Roar',
      limitedUse: {
        kind: 'uses',
        count: { kind: 'fixed', value: 3 },
        recovery: { minimumRest: 'long' },
      },
    } as MonsterAction
    expect(multiattackReferenceHasUsageRestriction(action)).toBe(true)
  })

  it('detects per-spell limited use without action-level limits', () => {
    const action = {
      id: 'spellcasting',
      kind: 'spell',
      profile: 'primary',
      name: 'Spellcasting',
      castingAbility: { kind: 'ability', ability: 'cha' },
      spells: [
        {
          spellId: 'srd-cc-5.2.1:fireball',
          limitedUse: {
            kind: 'uses',
            count: { kind: 'fixed', value: 1 },
            recovery: { minimumRest: 'long' },
          },
        },
      ],
    } as MonsterAction
    expect(multiattackReferenceHasUsageRestriction(action, 'srd-cc-5.2.1:mage-hand')).toBe(false)
    expect(multiattackReferenceHasUsageRestriction(action, 'srd-cc-5.2.1:fireball')).toBe(true)
  })

  it('ignores actions without configured limits', () => {
    const action = { id: 'bite', kind: 'natural-weapon', name: 'Bite' } as MonsterAction
    expect(multiattackReferenceHasUsageRestriction(action)).toBe(false)
  })
})

describe('multiattackIfAvailableSuffix', () => {
  const actions = new Map<string, MonsterAction>([
    [
      'recharge',
      {
        id: 'recharge',
        kind: 'special',
        name: 'Breath',
        limitedUse: { kind: 'recharge', minRoll: 5 },
      } as MonsterAction,
    ],
    ['free', { id: 'free', kind: 'special', name: 'Free' } as MonsterAction],
  ])

  it('returns a suffix when any referenced action is limited', () => {
    expect(
      multiattackIfAvailableSuffix([{ actionId: 'free' }, { actionId: 'recharge' }], (id) =>
        actions.get(id),
      ),
    ).toBe(' if available')
  })

  it('skips the suffix when requested', () => {
    expect(
      multiattackIfAvailableSuffix([{ actionId: 'recharge' }], (id) => actions.get(id), {
        skip: true,
      }),
    ).toBe('')
  })
})
