import { describe, expect, it, vi } from 'vitest'
import {
  createBlockedActionTarget,
  createEligibleActionTarget,
  createMalformedBatchValidationResult,
} from '@rpg/contracts'

import {
  createBatchValidateStrategy,
  createFanOutValidateStrategy,
  mergeBatchValidationTargets,
  resolveActionBatchValidationForLifecycle,
} from './action-validate-strategy'

describe('action-validate-strategy', () => {
  it('createFanOutValidateStrategy preserves per-target GET failures', async () => {
    const strategy = createFanOutValidateStrategy({
      getTargetIdentity: (target: { id: string; name: string }) => ({
        targetId: target.id,
        targetName: target.name,
      }),
      validateTarget: async (target) => {
        if (target.id === 'blocked') {
          return createBlockedActionTarget({ targetId: target.id, targetName: target.name }, [
            { kind: 'usage', characterId: 'char-1', characterName: 'Aldric' },
          ])
        }

        if (target.id === 'failed') {
          throw new Error('Network error')
        }

        return createEligibleActionTarget({ targetId: target.id, targetName: target.name })
      },
    })

    const result = await strategy.validate([
      { id: 'eligible', name: 'Eligible' },
      { id: 'blocked', name: 'Blocked' },
      { id: 'failed', name: 'Failed' },
    ])

    expect(result.validation.targets.filter((target) => target.status === 'eligible')).toHaveLength(
      1,
    )
    expect(result.validation.targets.filter((target) => target.status === 'blocked')).toHaveLength(
      1,
    )
    expect(result.failures).toEqual([
      expect.objectContaining({
        targetId: 'failed',
        failure: expect.objectContaining({ code: 'request_error' }),
      }),
    ])
  })

  it('createBatchValidateStrategy performs exactly one fetch per validate call', async () => {
    const fetchBatch = vi.fn(async () => ({
      targets: [
        {
          targetId: 'row-1',
          targetName: 'Row 1',
          availability: { status: 'allowed' as const },
        },
      ],
    }))

    const strategy = createBatchValidateStrategy({
      getTargetId: (row: { id: string }) => row.id,
      fetchBatch,
      mapResponse: (_requestedIds, response) => ({
        validation: {
          targets: response.targets.map((target) =>
            createEligibleActionTarget({
              targetId: target.targetId,
              targetName: target.targetName,
            }),
          ),
        },
        failures: [],
      }),
    })

    await strategy.validate([{ id: 'row-1' }])

    expect(fetchBatch).toHaveBeenCalledTimes(1)
  })

  it('createBatchValidateStrategy maps transport failures to whole-batch failures', async () => {
    const strategy = createBatchValidateStrategy({
      getTargetId: (row: { id: string }) => row.id,
      fetchBatch: async () => {
        throw new Error('Server unavailable')
      },
      mapResponse: () => ({ validation: { targets: [] }, failures: [] }),
    })

    const result = await strategy.validate([{ id: 'row-1' }, { id: 'row-2' }])

    expect(result.validation.targets).toHaveLength(0)
    expect(result.failures).toHaveLength(2)
    expect(result.failures.every((entry) => entry.failure.code === 'request_error')).toBe(true)
  })

  it('resolveActionBatchValidationForLifecycle throws when validate failures exist', () => {
    expect(() =>
      resolveActionBatchValidationForLifecycle(
        {
          validation: { targets: [] },
          failures: [{ targetId: 'row-1', failure: { code: 'not_found', message: 'Missing' } }],
        },
        new Map([['row-1', 'Row 1']]),
      ),
    ).toThrow('Row 1: Missing')
  })

  it('mergeBatchValidationTargets preserves row order with pre-eligible rows', () => {
    const merged = mergeBatchValidationTargets(
      [{ targetId: 'a' }, { targetId: 'b' }, { targetId: 'c' }],
      new Map([['a', createEligibleActionTarget({ targetId: 'a', targetName: 'Alpha' })]]),
      {
        targets: [
          createBlockedActionTarget({ targetId: 'b', targetName: 'Beta' }, [
            { kind: 'usage', characterId: 'char-1', characterName: 'Aldric' },
          ]),
          createEligibleActionTarget({ targetId: 'c', targetName: 'Gamma' }),
        ],
      },
    )

    expect(merged.targets.map((target) => target.targetId)).toEqual(['a', 'b', 'c'])
    expect(merged.targets[0]?.status).toBe('eligible')
    expect(merged.targets[1]?.status).toBe('blocked')
  })

  it('does not silently recover from malformed batch correspondence', () => {
    const malformed = createMalformedBatchValidationResult(['row-1', 'row-2'])

    expect(() =>
      resolveActionBatchValidationForLifecycle(malformed, new Map([['row-1', 'Row 1']])),
    ).toThrow()
    expect(malformed.failures).toHaveLength(2)
  })
})
