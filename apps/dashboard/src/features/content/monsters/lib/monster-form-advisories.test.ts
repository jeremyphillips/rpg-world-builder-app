import { describe, expect, it } from 'vitest'

import type { MonsterFormValues } from './monster-form-values'
import {
  collectMonsterFormAdvisories,
  LEAP_MISSING_WALK_SPEED_MESSAGE,
  LEAP_MOVEMENT_EXCEEDS_WALK_SPEED_MESSAGE,
  LEAP_ZERO_WALK_SPEED_MESSAGE,
} from './monster-form-advisories'

describe('collectMonsterFormAdvisories', () => {
  it('warns when multiattack targets an unavailable action', () => {
    const values = {
      actions: [
        { id: 'bite', kind: 'attack', name: 'Bite', available: false },
        {
          id: 'multi',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [{ count: 2, actionIds: ['bite'] }],
        },
      ],
      bonusActions: [],
      reactions: [],
      equipment: [],
    } as unknown as MonsterFormValues

    const advisories = collectMonsterFormAdvisories(values, new Map())

    expect(advisories).toEqual([
      {
        code: 'multiattack-unavailable-action',
        message: 'Bite is unavailable, so this multiattack cannot use it.',
        path: 'actions.1',
      },
    ])
  })

  it('warns once for a complete leap when Walk Speed is missing, zero, or too small', () => {
    const leap = {
      id: 'leap',
      kind: 'leap',
      name: 'Leap',
      distanceFeet: 30,
      movementFeet: 40,
    }
    const values = {
      actions: [],
      bonusActions: [leap],
      reactions: [],
      equipment: [],
      movement: [],
    } as unknown as MonsterFormValues

    expect(collectMonsterFormAdvisories(values, new Map())).toEqual([
      {
        code: 'leap-missing-walk-speed',
        message: LEAP_MISSING_WALK_SPEED_MESSAGE,
        path: 'bonusActions.0',
      },
    ])

    values.movement = [{ mode: 'walk', feet: '' }]
    expect(collectMonsterFormAdvisories(values, new Map())).toEqual([])

    values.movement = [{ mode: 'walk', feet: 0 }]
    expect(collectMonsterFormAdvisories(values, new Map())).toEqual([
      {
        code: 'leap-zero-walk-speed',
        message: LEAP_ZERO_WALK_SPEED_MESSAGE,
        path: 'bonusActions.0',
      },
    ])

    values.movement = [{ mode: 'walk', feet: 30 }]
    expect(collectMonsterFormAdvisories(values, new Map())).toEqual([
      {
        code: 'leap-movement-exceeds-walk-speed',
        message: LEAP_MOVEMENT_EXCEEDS_WALK_SPEED_MESSAGE,
        path: 'bonusActions.0',
      },
    ])

    values.bonusActions = [{ ...leap, movementFeet: 10 }]
    expect(collectMonsterFormAdvisories(values, new Map())).toEqual([])

    values.bonusActions = [{ ...leap, distanceFeet: undefined }]
    values.movement = []
    expect(collectMonsterFormAdvisories(values, new Map())).toEqual([])

    values.bonusActions = [{ id: 'step', kind: 'teleport', name: 'Teleport', distanceFeet: 40 }]
    expect(collectMonsterFormAdvisories(values, new Map())).toEqual([])
  })
})
