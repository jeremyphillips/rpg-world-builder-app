/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ActionApplyOutcome, ActionTargetFailure } from '@rpg/contracts'

import { useActionLifecycle } from './use-action-lifecycle'

describe('useActionLifecycle', () => {
  it('transitions configure → resolve when validation finds blockers', async () => {
    const onClose = vi.fn()

    const { result } = renderHook(() =>
      useActionLifecycle({
        open: true,
        targets: [{ targetId: 'a', targetName: 'Alpha' }],
        validate: async () => ({
          targets: [
            {
              status: 'blocked',
              targetId: 'a',
              targetName: 'Alpha',
              blockers: [{ kind: 'rule', code: 'in-use', message: 'In use.' }],
            },
          ],
        }),
        apply: vi.fn(),
        onClose,
      }),
    )

    await act(async () => {
      await result.current.startApply({ mode: 'off' })
    })

    expect(result.current.phase).toBe('resolve')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes with success when validation passes and apply succeeds', async () => {
    const onClose = vi.fn()

    const { result } = renderHook(() =>
      useActionLifecycle({
        open: true,
        targets: [{ targetId: 'a', targetName: 'Alpha' }],
        validate: async () => ({
          targets: [{ status: 'eligible', targetId: 'a', targetName: 'Alpha' }],
        }),
        apply: async () => [{ status: 'updated', targetId: 'a' }],
        onClose,
      }),
    )

    await act(async () => {
      await result.current.startApply({ mode: 'off' })
    })

    expect(onClose).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'success', fullSuccess: true }),
    )
  })

  it('does not surface localError when apply succeeds but onClose throws', async () => {
    const onClose = vi.fn(() => {
      throw new Error('Close side effect failed.')
    })

    const { result } = renderHook(() =>
      useActionLifecycle({
        open: true,
        targets: [{ targetId: 'a', targetName: 'Alpha' }],
        validate: async () => ({
          targets: [{ status: 'eligible', targetId: 'a', targetName: 'Alpha' }],
        }),
        apply: async () => [{ status: 'updated', targetId: 'a' }],
        onClose,
      }),
    )

    await act(async () => {
      await result.current.startApply({ mode: 'off' })
    })

    expect(onClose).toHaveBeenCalled()
    expect(result.current.localError).toBeNull()
  })

  it('preserves Error.message when apply throws', async () => {
    const onClose = vi.fn()

    const { result } = renderHook(() =>
      useActionLifecycle({
        open: true,
        targets: [{ targetId: 'a', targetName: 'Alpha' }],
        requiresValidation: false,
        apply: async () => {
          throw new Error('Cache update failed.')
        },
        onClose,
      }),
    )

    await act(async () => {
      await result.current.startApply({ mode: 'off' })
    })

    expect(result.current.localError).toBe('Cache update failed.')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('returns to configure with localError when validate throws', async () => {
    const onClose = vi.fn()

    const { result } = renderHook(() =>
      useActionLifecycle({
        open: true,
        targets: [
          { targetId: 'a', targetName: 'Alpha' },
          { targetId: 'b', targetName: 'Beta' },
        ],
        validate: async () => {
          throw new Error(
            'Alpha: Availability could not be checked.\nBeta: Availability could not be checked.',
          )
        },
        apply: vi.fn(),
        onClose,
      }),
    )

    await act(async () => {
      await result.current.startApply({ mode: 'off' })
    })

    expect(result.current.phase).toBe('configure')
    expect(result.current.localError).toContain('Alpha')
    expect(result.current.localError).toContain('Beta')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('skips validation when requiresValidation is false', async () => {
    const onClose = vi.fn()
    const apply = vi.fn(
      async (): Promise<ActionApplyOutcome<unknown, ActionTargetFailure>[]> => [
        { status: 'updated', targetId: 'a' },
      ],
    )

    const { result } = renderHook(() =>
      useActionLifecycle({
        open: true,
        targets: [{ targetId: 'a', targetName: 'Alpha' }],
        requiresValidation: false,
        apply,
        onClose,
      }),
    )

    await act(async () => {
      await result.current.startApply({ mode: 'active' })
    })

    expect(apply).toHaveBeenCalledWith(['a'], { mode: 'active' })
  })

  it('merges apply-time blocked outcomes into the committed validation snapshot only', async () => {
    const onClose = vi.fn()

    const { result } = renderHook(() =>
      useActionLifecycle({
        open: true,
        targets: [
          { targetId: 'a', targetName: 'Alpha' },
          { targetId: 'b', targetName: 'Beta' },
          { targetId: 'c', targetName: 'Gamma' },
        ],
        validate: async () => ({
          targets: [
            { status: 'eligible', targetId: 'a', targetName: 'Alpha' },
            { status: 'eligible', targetId: 'b', targetName: 'Beta' },
          ],
        }),
        apply: async (targetIds) =>
          targetIds.map((targetId) =>
            targetId === 'b'
              ? {
                  status: 'blocked' as const,
                  targetId,
                  blockers: [{ kind: 'rule', code: 'race', message: 'Blocked.' }],
                }
              : { status: 'updated' as const, targetId },
          ),
        onClose,
      }),
    )

    await act(async () => {
      await result.current.startApply({ mode: 'off' })
    })

    expect(result.current.phase).toBe('resolve')
    expect(result.current.validationResult?.targets).toHaveLength(2)
    expect(result.current.validationResult?.targets.map((target) => target.targetId)).toEqual([
      'a',
      'b',
    ])
    expect(onClose).not.toHaveBeenCalled()
  })
})
