import { describe, expect, it } from 'vitest'

import { createMonsterDraftInputSchema, createMonsterInputSchema } from '../monster'
import { multiattackValidationMessages } from './action/multiattack-validation-messages'
import { BITE_ACTION, issueMessages, MONSTER_TEST_BODY } from './test-fixtures'

const HOLY_BURST = {
  id: 'holy-burst',
  kind: 'special' as const,
  name: 'Holy Burst',
  description: 'A burst of radiance.',
}

describe('monster multiattack draft vs publish validation', () => {
  it('accepts draft with a dangling attack-group reference', () => {
    const parsed = createMonsterDraftInputSchema.safeParse({
      slug: 'draft-dangling-ref',
      ...MONSTER_TEST_BODY,
      actions: [
        BITE_ACTION,
        {
          id: 'multiattack',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [{ count: 1, actionIds: ['not-there'] }],
        },
      ],
    })
    expect(parsed.success, issueMessages(parsed).join('; ')).toBe(true)
  })

  it('rejects publish with a dangling attack-group reference on an actionable path', () => {
    const parsed = createMonsterInputSchema.safeParse({
      slug: 'publish-dangling-ref',
      ...MONSTER_TEST_BODY,
      actions: [
        BITE_ACTION,
        {
          id: 'multiattack',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [{ count: 1, actionIds: ['not-there'] }],
        },
      ],
    })
    expect(parsed.success).toBe(false)
    if (parsed.success) return
    const paths = parsed.error.issues.map((issue) => issue.path.join('.'))
    expect(paths).toContain('actions.1.steps.0.actionIds.0')
  })

  it('accepts draft with use-only steps and no attack group', () => {
    const parsed = createMonsterDraftInputSchema.safeParse({
      slug: 'draft-use-only',
      ...MONSTER_TEST_BODY,
      actions: [
        HOLY_BURST,
        {
          id: 'multiattack',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [{ kind: 'use', mode: 'single', actionId: 'holy-burst' }],
        },
      ],
    })
    expect(parsed.success, issueMessages(parsed).join('; ')).toBe(true)
  })

  it('rejects publish when no attack group is present', () => {
    const parsed = createMonsterInputSchema.safeParse({
      slug: 'publish-use-only',
      ...MONSTER_TEST_BODY,
      actions: [
        HOLY_BURST,
        {
          id: 'multiattack',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [{ kind: 'use', mode: 'single', actionId: 'holy-burst' }],
        },
      ],
    })
    expect(parsed.success).toBe(false)
    if (parsed.success) return
    expect(
      parsed.error.issues.some(
        (issue) =>
          issue.message === multiattackValidationMessages.addAttackGroup() &&
          issue.path.join('.') === 'actions.1.steps',
      ),
    ).toBe(true)
  })

  it('accepts draft with an empty use-step actionId', () => {
    const parsed = createMonsterDraftInputSchema.safeParse({
      slug: 'draft-empty-use',
      ...MONSTER_TEST_BODY,
      actions: [
        BITE_ACTION,
        {
          id: 'multiattack',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [
            { count: 1, actionIds: ['bite'] },
            { kind: 'use', mode: 'single' },
          ],
        },
      ],
    })
    expect(parsed.success, issueMessages(parsed).join('; ')).toBe(true)
  })

  it('rejects publish when a use step has no actionId', () => {
    const parsed = createMonsterInputSchema.safeParse({
      slug: 'publish-empty-use',
      ...MONSTER_TEST_BODY,
      actions: [
        BITE_ACTION,
        {
          id: 'multiattack',
          kind: 'multiattack',
          name: 'Multiattack',
          steps: [
            { count: 1, actionIds: ['bite'] },
            { kind: 'use', mode: 'single' },
          ],
        },
      ],
    })
    expect(parsed.success).toBe(false)
    expect(issueMessages(parsed).length).toBeGreaterThan(0)
  })
})
