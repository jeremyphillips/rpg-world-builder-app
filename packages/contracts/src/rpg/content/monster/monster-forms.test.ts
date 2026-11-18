import { describe, expect, it } from 'vitest'

import { createMonsterDraftInputSchema, createMonsterInputSchema } from '../monster'
import { monsterActionDraftSchema } from './action'
import {
  FORM_RESTRICTION_DUPLICATE_MESSAGE,
  FORM_RESTRICTION_EMPTY_MESSAGE,
  FORM_RESTRICTION_REQUIRES_FORMS_MESSAGE,
  FORM_RESTRICTION_UNRESOLVED_MESSAGE,
} from './form-availability'
import { BITE_ACTION, MONSTER_TEST_BODY } from './test-fixtures'

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

    const emptyRestriction = createMonsterInputSchema.safeParse({
      slug: 'empty-restriction',
      ...MONSTER_TEST_BODY,
      forms,
      actions: [{ ...BITE_ACTION, onlyInFormIds: [] }],
    })
    expect(emptyRestriction.success).toBe(false)
    if (!emptyRestriction.success) {
      expect(emptyRestriction.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['actions', 0, 'onlyInFormIds'],
          message: FORM_RESTRICTION_EMPTY_MESSAGE,
        }),
      )
    }

    const duplicateIds = createMonsterInputSchema.safeParse({
      slug: 'duplicate-restriction',
      ...MONSTER_TEST_BODY,
      forms,
      actions: [{ ...BITE_ACTION, onlyInFormIds: ['bear', 'bear'] }],
    })
    expect(duplicateIds.success).toBe(false)
    if (!duplicateIds.success) {
      expect(duplicateIds.error.issues).toContainEqual(
        expect.objectContaining({ message: FORM_RESTRICTION_DUPLICATE_MESSAGE }),
      )
    }

    const unresolved = createMonsterInputSchema.safeParse({
      slug: 'unresolved-restriction',
      ...MONSTER_TEST_BODY,
      forms,
      actions: [{ ...BITE_ACTION, onlyInFormIds: ['profile'] }],
    })
    expect(unresolved.success).toBe(false)
    if (!unresolved.success) {
      expect(unresolved.error.issues).toContainEqual(
        expect.objectContaining({ message: FORM_RESTRICTION_UNRESOLVED_MESSAGE }),
      )
    }

    const withoutForms = createMonsterInputSchema.safeParse({
      slug: 'restriction-without-forms',
      ...MONSTER_TEST_BODY,
      actions: [{ ...BITE_ACTION, onlyInFormIds: ['bear'] }],
    })
    expect(withoutForms.success).toBe(false)
    if (!withoutForms.success) {
      expect(withoutForms.error.issues).toContainEqual(
        expect.objectContaining({ message: FORM_RESTRICTION_REQUIRES_FORMS_MESSAGE }),
      )
    }

    const everyForm = createMonsterInputSchema.safeParse({
      slug: 'every-form',
      ...MONSTER_TEST_BODY,
      forms,
      actions: [{ ...BITE_ACTION, onlyInFormIds: ['humanoid', 'bear'] }],
    })
    expect(everyForm.success).toBe(true)

    const draft = createMonsterDraftInputSchema.safeParse({
      slug: 'restriction-draft',
      ...MONSTER_TEST_BODY,
      forms,
      actions: [{ ...BITE_ACTION, onlyInFormIds: [] }],
      traits: [
        {
          id: 'adhesive',
          kind: 'custom',
          name: 'Adhesive',
          description: '<p>Sticky.</p>',
          onlyInFormIds: ['missing'],
        },
      ],
    })
    expect(draft.success).toBe(true)

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
