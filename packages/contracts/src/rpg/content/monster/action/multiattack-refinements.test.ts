import { describe, expect, it } from 'vitest'
import { type z } from 'zod'

import { multiattackValidationMessages } from './multiattack-validation-messages'
import { refinePublishedMultiattack } from './multiattack-refinements'

function collectIssues(
  action: Record<string, unknown>,
  actionsById: Map<string, { id: string; kind: string }>,
) {
  const issues: z.ZodIssue[] = []
  refinePublishedMultiattack(action, 'actions', ['actions', 0], actionsById, new Map(), {
    addIssue: (issue: z.ZodIssue) => issues.push(issue),
  } as unknown as z.RefinementCtx)
  return issues
}

describe('refinePublishedMultiattack use spell repetition', () => {
  const spellcasting = { id: 'spellcasting', kind: 'spell' }
  const bite = { id: 'bite', kind: 'natural-weapon' }
  const actionsById = new Map([
    ['spellcasting', spellcasting],
    ['bite', bite],
  ])

  it('rejects count above one on spellcasting use steps', () => {
    const issues = collectIssues(
      {
        id: 'multiattack',
        kind: 'multiattack',
        steps: [
          { count: 1, actionIds: ['bite'] },
          { kind: 'use', mode: 'single', actionId: 'spellcasting', count: 2 },
        ],
      },
      actionsById,
    )
    expect(
      issues.some(
        (issue) =>
          issue.message === multiattackValidationMessages.useSpellRepetitionForbidden() &&
          issue.path.join('.') === 'actions.0.steps.1.count',
      ),
    ).toBe(true)
  })

  it('allows single spellcasting use without repetition', () => {
    const issues = collectIssues(
      {
        id: 'multiattack',
        kind: 'multiattack',
        steps: [{ kind: 'use', mode: 'single', actionId: 'spellcasting' }],
      },
      actionsById,
    )
    expect(issues.some((issue) => issue.path.at(-1) === 'count')).toBe(false)
  })
})
