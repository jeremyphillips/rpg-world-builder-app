/**
 * @vitest-environment jsdom
 */
import { z } from 'zod'
import { renderHook, act } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import type { FormItem } from '@rpg/ui/form'

import { useRunnerFormSubmit } from './runner-form-submit.lib'

const fields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name' }]
const schema = z.object({ name: z.string().min(1, 'Name is required.') })

describe('useRunnerFormSubmit', () => {
  it('does not call persist when schema evaluation fails', async () => {
    const persist = vi.fn()
    const { result } = renderHook(() =>
      useRunnerFormSubmit<{ name: string }>({
        schema,
        resolverFields: fields,
        fallbackMessage: 'Could not save.',
        persist,
        mountProducerChrome: false,
      }),
    )

    const form = renderHook(() => useForm<{ name: string }>({ defaultValues: { name: '' } })).result
      .current

    await act(async () => {
      await expect(result.current.onSubmit({ name: '' }, form)).rejects.toThrow()
    })

    expect(persist).not.toHaveBeenCalled()
    expect(form.getFieldState('name').error?.message).toBe('Name is required.')
  })
})
