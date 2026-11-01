import { describe, expect, it } from 'vitest'

import type { MonsterFormValues } from './monster-form-values'
import { collectMonsterFormAdvisories } from './monster-form-advisories'

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
})
