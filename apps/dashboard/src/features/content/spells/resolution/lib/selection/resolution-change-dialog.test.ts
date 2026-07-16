import { describe, expect, it } from 'vitest'

import { planResolutionChange, type ResolutionEffectRef } from '@rpg/contracts'

import { formatChangePlanForDialog } from './resolution-change-dialog.lib'
import { describeEffectForConfirm } from './resolution-selection-options.lib'

describe('formatChangePlanForDialog', () => {
  it('aggregates method, pattern, and effect consequences', () => {
    const before = {
      proximityKind: 'distance' as const,
      proximityDistanceFt: 120,
      targetKind: 'creature-or-object',
      targetCount: 1,
      methodKind: 'attack' as const,
      attackType: 'ranged-spell' as const,
      applicationPatternKind: 'projectiles' as const,
      effects: [
        {
          id: 'damage',
          kind: 'damage',
          roll: { dice: { count: 1, faces: 10 } },
          damageType: 'force',
        },
      ],
    }

    const change = { field: 'proximityKind' as const, value: 'self' as const }
    const plan = planResolutionChange(before, change)
    const copy = formatChangePlanForDialog(plan, change)

    expect(copy.headline).toBe('Change target proximity?')
    expect(copy.consequences).toContain('invalidate the current Ranged spell attack selection')
    expect(copy.consequences).toContain('remove the Projectiles application pattern')
    expect(plan.effectsToRemove).toEqual([])
  })
})

describe('describeEffectForConfirm', () => {
  it('formats compact effect bullets', () => {
    expect(
      describeEffectForConfirm({
        id: 'healing',
        kind: 'healing',
        roll: { dice: { count: 2, faces: 8 } },
      } as ResolutionEffectRef & { roll: { dice: { count: number; faces: number } } }),
    ).toBe('Healing — 2d8')
  })
})
