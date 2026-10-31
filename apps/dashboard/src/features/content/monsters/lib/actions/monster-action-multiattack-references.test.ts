import { describe, expect, it } from 'vitest'

import {
  multiattacksReferencingAction,
  stripMultiattackActionId,
} from './monster-action-multiattack-references'
import type { MonsterActionDraftRow } from './monster-action-presets'

const bite = { id: 'bite', kind: 'natural-weapon', name: 'Bite' } as MonsterActionDraftRow
const multi = {
  id: 'multi',
  kind: 'multiattack',
  name: 'Multiattack',
  steps: [{ count: 2, actionIds: ['bite'] }],
} as MonsterActionDraftRow

describe('multiattack references', () => {
  it('names multiattacks that reference an action and removes only that id', () => {
    expect(
      multiattacksReferencingAction([bite, multi], 'bite').map((action) => action.name),
    ).toEqual(['Multiattack'])
    const next = stripMultiattackActionId([bite, multi], 'bite')
    expect(next[1]?.steps).toEqual([{ count: 2, actionIds: [] }])
  })
})
