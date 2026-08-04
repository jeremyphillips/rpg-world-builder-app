import { describe, expect, it } from 'vitest'

import { deriveActionApplySummary } from './action-apply-summary.lib'

describe('deriveActionApplySummary', () => {
  it('partitions updated, blocked, and failed ids', () => {
    expect(
      deriveActionApplySummary([
        { status: 'updated', targetId: 'a' },
        {
          status: 'blocked',
          targetId: 'b',
          blockers: [{ kind: 'rule', code: 'x', message: 'No.' }],
        },
        { status: 'failed', targetId: 'c', failure: { code: 'request_error', message: 'Fail.' } },
      ]),
    ).toEqual({
      updatedIds: ['a'],
      blockedIds: ['b'],
      failedIds: ['c'],
      fullSuccess: false,
    })
  })

  it('marks fullSuccess only when updates exist with no blockers or failures', () => {
    expect(deriveActionApplySummary([{ status: 'updated', targetId: 'a' }])).toMatchObject({
      fullSuccess: true,
    })

    expect(
      deriveActionApplySummary([
        { status: 'updated', targetId: 'a' },
        { status: 'failed', targetId: 'b', failure: { code: 'request_error', message: 'Fail.' } },
      ]),
    ).toMatchObject({
      fullSuccess: false,
    })

    expect(
      deriveActionApplySummary([
        {
          status: 'blocked',
          targetId: 'a',
          blockers: [{ kind: 'rule', code: 'x', message: 'No.' }],
        },
      ]),
    ).toMatchObject({
      fullSuccess: false,
    })
  })
})
