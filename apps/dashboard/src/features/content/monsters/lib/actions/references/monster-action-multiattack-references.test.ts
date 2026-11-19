import { describe, expect, it } from 'vitest'

import { actionsReferencingAction, stripReferencedActionId } from '@rpg/contracts'

import type { MonsterActionDraftRow } from '../monster-action-presets'

const bite = { id: 'bite', kind: 'natural-weapon', name: 'Bite' } as MonsterActionDraftRow
const multi = {
  id: 'multi',
  kind: 'multiattack',
  name: 'Multiattack',
  steps: [{ count: 2, actionIds: ['bite'] }],
} as MonsterActionDraftRow

describe('action references', () => {
  it('names multiattacks that reference an action and removes only that id', () => {
    expect(actionsReferencingAction([bite, multi], 'bite').map((action) => action.name)).toEqual([
      'Multiattack',
    ])
    const next = stripReferencedActionId([bite, multi], 'bite')
    const updated = next[1]
    expect(updated?.kind === 'multiattack' ? updated.steps : undefined).toEqual([
      { count: 2, actionIds: [] },
    ])
  })

  it('strips an id from a legendary action reference', () => {
    const reference = {
      id: 'pounce',
      kind: 'action-reference',
      name: 'Pounce',
      actionIds: ['bite', 'claw'],
    } as MonsterActionDraftRow
    expect(actionsReferencingAction([bite, reference], 'bite').map((action) => action.id)).toEqual([
      'pounce',
    ])
    const next = stripReferencedActionId([reference], 'bite')
    expect(next[0]?.kind === 'action-reference' ? next[0].actionIds : undefined).toEqual(['claw'])
  })
})
