import { describe, expect, it } from 'vitest'

import { createMonsterDraftInputSchema, createMonsterInputSchema } from '../monster'
import { monsterActionDraftSchema } from './action'
import { MONSTER_TEST_BODY } from './test-fixtures'

const forms = {
  profileFormId: 'profile',
  trueForm: { kind: 'defined' as const, formId: 'humanoid' },
  definedForms: [
    { id: 'humanoid', name: 'Humanoid', overrides: {} },
    { id: 'bear', name: 'Bear', overrides: { sizes: ['large'] } },
  ],
}

describe('monster forms', () => {
  it('accepts a recoverable draft with an unresolved designation and empty forms', () => {
    const parsed = createMonsterDraftInputSchema.safeParse({
      slug: 'forms-draft',
      ...MONSTER_TEST_BODY,
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined' },
        definedForms: [],
      },
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects missing names, destinations, duplicate identity, and true-form overrides', () => {
    const missingName = createMonsterInputSchema.safeParse({
      slug: 'forms-name',
      ...MONSTER_TEST_BODY,
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'profile' },
        definedForms: [{ id: 'bear' }],
      },
    })
    expect(missingName.success).toBe(false)
    if (!missingName.success) {
      expect(missingName.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['forms', 'definedForms', 0, 'name'],
          message: 'Enter a form name.',
        }),
      )
    }

    const empty = createMonsterInputSchema.safeParse({
      slug: 'forms-empty',
      ...MONSTER_TEST_BODY,
      forms: { profileFormId: 'profile', trueForm: { kind: 'profile' }, definedForms: [] },
    })
    if (empty.success) throw new Error('Expected empty forms to fail')
    expect(empty.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['forms', 'definedForms'],
          message: 'Add a form or remove the forms configuration.',
        }),
      ]),
    )

    const duplicate = createMonsterInputSchema.safeParse({
      slug: 'forms-dup',
      ...MONSTER_TEST_BODY,
      forms: {
        profileFormId: 'humanoid',
        trueForm: { kind: 'profile', name: 'Humanoid' },
        definedForms: [
          { id: 'humanoid', name: 'humanoid' },
          { id: 'other', name: 'Humanoid' },
        ],
      },
    })
    if (duplicate.success) throw new Error('Expected duplicate forms to fail')
    expect(duplicate.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['forms', 'trueForm', 'name'],
          message: 'Form names must be unique.',
        }),
        expect.objectContaining({
          path: ['forms', 'definedForms', 0, 'name'],
          message: 'Form names must be unique.',
        }),
      ]),
    )

    const overriddenTrue = createMonsterInputSchema.safeParse({
      slug: 'forms-overridden-true',
      ...MONSTER_TEST_BODY,
      forms: {
        ...forms,
        definedForms: [
          { id: 'humanoid', name: 'Humanoid', overrides: { sizes: ['large'] } },
          forms.definedForms[1],
        ],
      },
    })
    if (overriddenTrue.success) throw new Error('Expected true-form overrides to fail')
    expect(overriddenTrue.error.issues).toContainEqual(
      expect.objectContaining({
        path: ['forms', 'trueForm', 'formId'],
        message: 'The true form uses base statistics. Remove its statistic overrides.',
      }),
    )
  })

  it('claims unresolved true-form issues before destination issues', () => {
    const missingSelection = createMonsterInputSchema.safeParse({
      slug: 'forms-missing-selection',
      ...MONSTER_TEST_BODY,
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined' },
        definedForms: [{ id: 'bear', name: 'Bear' }],
      },
    })
    if (missingSelection.success) throw new Error('Expected missing selection to fail')
    expect(missingSelection.error.issues).toContainEqual(
      expect.objectContaining({
        path: ['forms', 'trueForm', 'formId'],
        message: 'Select the true form.',
      }),
    )
    expect(missingSelection.error.issues).not.toContainEqual(
      expect.objectContaining({ message: 'Add a form other than the true form.' }),
    )

    const missingRow = createMonsterInputSchema.safeParse({
      slug: 'forms-missing-row',
      ...MONSTER_TEST_BODY,
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'missing' },
        definedForms: [{ id: 'bear', name: 'Bear' }],
      },
    })
    if (missingRow.success) throw new Error('Expected missing true form to fail')
    expect(missingRow.error.issues).toContainEqual(
      expect.objectContaining({
        path: ['forms', 'trueForm', 'formId'],
        message: 'Select an existing form as the true form.',
      }),
    )
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
