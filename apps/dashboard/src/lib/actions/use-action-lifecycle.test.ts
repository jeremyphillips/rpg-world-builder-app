/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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

  it('skips validation when requiresValidation is false', async () => {
    const onClose = vi.fn()
    const apply = vi.fn(
      async (): Promise<
        import('@rpg/contracts').ActionApplyOutcome<
          unknown,
          import('@rpg/contracts').ActionTargetFailure
        >[]
      > => [{ status: 'updated', targetId: 'a' }],
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
})
