import { describe, expect, it } from 'vitest'

import { FIGHTER } from '../fixtures'
import {
  resolveClassFeatureSummaryItems,
  resolveSubclassSummaryItems,
} from './class-overview-summary-items'

describe('resolveSubclassSummaryItems', () => {
  it('maps subclass summaries to collection items', () => {
    expect(
      resolveSubclassSummaryItems({
        ...FIGHTER,
        subclasses: [
          { id: 'champion', name: 'Champion' },
          { id: 'battle-master', name: 'Battle Master' },
        ],
      }),
    ).toEqual([
      { id: 'champion', label: 'Champion' },
      { id: 'battle-master', label: 'Battle Master' },
    ])
  })
})

describe('resolveClassFeatureSummaryItems', () => {
  it('preserves feature order and includes level secondary metadata', () => {
    const features = [
      { kind: 'custom' as const, id: 'rage', name: 'Rage', level: 1 },
      { kind: 'custom' as const, id: 'reckless-attack', name: 'Reckless Attack', level: 2 },
    ]

    expect(resolveClassFeatureSummaryItems({ ...FIGHTER, features })).toEqual([
      { id: 'rage', label: 'Rage', secondary: 'Level 1' },
      { id: 'reckless-attack', label: 'Reckless Attack', secondary: 'Level 2' },
    ])
  })
})
