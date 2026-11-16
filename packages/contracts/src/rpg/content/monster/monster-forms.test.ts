import { describe, expect, it } from 'vitest'

import { createMonsterDraftInputSchema, createMonsterInputSchema } from '../monster'
import { monsterActionDraftSchema } from './action'
import { MONSTER_TEST_BODY } from './test-fixtures'

const forms = {
  trueForm: { id: 'humanoid', name: 'Humanoid', appearance: 'humanoid' },
  alternates: [{ id: 'bear', name: 'Bear', appearance: 'bear', overrides: { sizes: ['large'] } }],
}

describe('monster forms', () => {
  it('accepts a draft with a missing name and an empty alternate list', () => {
    const parsed = createMonsterDraftInputSchema.safeParse({
      slug: 'forms-draft',
      ...MONSTER_TEST_BODY,
      forms: { trueForm: { id: 'humanoid' }, alternates: [] },
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects a publish with a missing name, no alternates, or duplicate ids and names', () => {
    const missingName = createMonsterInputSchema.safeParse({
      slug: 'forms-name',
      ...MONSTER_TEST_BODY,
      forms: { trueForm: { id: 'humanoid' }, alternates: [{ id: 'bear', name: 'Bear' }] },
    })
    expect(missingName.success).toBe(false)
    if (!missingName.success) {
      expect(missingName.error.issues.some((issue) => issue.message === 'Name is required')).toBe(
        true,
      )
    }

    const empty = createMonsterInputSchema.safeParse({
      slug: 'forms-empty',
      ...MONSTER_TEST_BODY,
      forms: { trueForm: { id: 'humanoid', name: 'Humanoid' }, alternates: [] },
    })
    expect(empty.success).toBe(false)

    const duplicate = createMonsterInputSchema.safeParse({
      slug: 'forms-dup',
      ...MONSTER_TEST_BODY,
      forms: {
        trueForm: { id: 'humanoid', name: 'Humanoid' },
        alternates: [
          { id: 'humanoid', name: 'humanoid' },
          { id: 'other', name: 'Humanoid' },
        ],
      },
    })
    expect(duplicate.success).toBe(false)
  })

  it('keeps unavailable active keys off shape-shift and rejects a second row or bad reference', () => {
    const option = monsterActionDraftSchema.options.find(
      (entry) => entry.shape.kind.value === 'shape-shift',
    )
    expect(option).toBeDefined()
    expect(Object.keys(option?.shape ?? {})).not.toContain('onlyInFormIds')
    expect(Object.keys(option?.shape ?? {})).not.toContain('onceUntilNextTurn')
    expect(Object.keys(monsterActionDraftSchema.options[0]?.shape ?? {})).toContain('onlyInFormIds')

    const second = createMonsterInputSchema.safeParse({
      slug: 'two-shifts',
      ...MONSTER_TEST_BODY,
      forms,
      actions: [{ id: 'shift-a', kind: 'shape-shift', equipment: 'unchanged' }],
      bonusActions: [{ id: 'shift-b', kind: 'shape-shift', equipment: 'unchanged' }],
    })
    expect(second.success).toBe(false)

    const referenced = createMonsterInputSchema.safeParse({
      slug: 'shift-target',
      ...MONSTER_TEST_BODY,
      forms,
      actions: [
        { id: 'shift', kind: 'shape-shift', equipment: 'unchanged' },
        {
          id: 'multi',
          kind: 'multiattack',
          steps: [{ count: 1, actionIds: ['shift'] }],
        },
      ],
    })
    expect(referenced.success).toBe(false)
  })
})
