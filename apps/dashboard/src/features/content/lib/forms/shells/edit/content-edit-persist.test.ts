import { describe, expect, it, vi } from 'vitest'
import type { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { consumeContentFormPersistBaselineReset } from '../submit/content-form-persist-baseline-reset.lib'
import { persistContentEditUpdate } from './content-edit-persist.lib'

describe('persistContentEditUpdate baseline sync guard', () => {
  it('skips post-save reset when isAttemptCurrent is false', async () => {
    const reset = vi.fn()
    const form = { reset, resetField: vi.fn() } as unknown as UseFormReturn<{ name: string }>

    const def = {
      schema: z.object({ name: z.string() }),
      toFormValues: (row: { name: string }) => ({ name: row.name }),
      queryKey: () => ['feats'],
    }

    await persistContentEditUpdate({
      def: def as never,
      entity: { id: 'feat-1', catalogLayer: 'homebrew', name: 'Old' },
      campaignId: 'camp-1',
      layoutCtx: { campaignId: 'camp-1', mode: 'edit' } as never,
      wireInput: { name: 'Saved' },
      form,
      mutation: { mutateAsync: vi.fn().mockResolvedValue({ id: 'feat-1', name: 'Saved' }) },
      queryClient: { setQueryData: vi.fn() } as never,
      setOverlayBaseline: vi.fn(),
      validationIntent: 'publish',
      isAttemptCurrent: () => false,
    })

    expect(reset).not.toHaveBeenCalled()
    expect(consumeContentFormPersistBaselineReset(form)).toBe(false)
  })

  it('applies post-save reset when isAttemptCurrent is true', async () => {
    const reset = vi.fn()
    const form = { reset, resetField: vi.fn() } as unknown as UseFormReturn<{ name: string }>

    const def = {
      schema: z.object({ name: z.string() }),
      toFormValues: (row: { name: string }) => ({ name: row.name }),
      queryKey: () => ['feats'],
    }

    await persistContentEditUpdate({
      def: def as never,
      entity: { id: 'feat-1', catalogLayer: 'homebrew', name: 'Old' },
      campaignId: 'camp-1',
      layoutCtx: { campaignId: 'camp-1', mode: 'edit' } as never,
      wireInput: { name: 'Saved' },
      form,
      mutation: { mutateAsync: vi.fn().mockResolvedValue({ id: 'feat-1', name: 'Saved' }) },
      queryClient: { setQueryData: vi.fn() } as never,
      setOverlayBaseline: vi.fn(),
      validationIntent: 'publish',
      isAttemptCurrent: () => true,
    })

    expect(reset).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Saved',
      }),
    )
    expect(consumeContentFormPersistBaselineReset(form)).toBe(true)
  })
})
