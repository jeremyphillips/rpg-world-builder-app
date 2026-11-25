/**
 * @vitest-environment jsdom
 */
import { ApiError } from '@rpg/contracts'
import { renderHook, act } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { useAdoptedFormSubmit } from './form-validation-adoption.lib'

describe('useAdoptedFormSubmit', () => {
  it('paints structured api issues on the form', async () => {
    const { result } = renderHook(() =>
      useAdoptedFormSubmit<{ name: string }>(
        vi.fn().mockRejectedValue(
          new ApiError(400, 'validation_error', 'Validation failed', {
            issues: [{ path: 'name', message: 'Taken', code: 'duplicate' }],
          }),
        ),
        'Could not save.',
      ),
    )

    const form = renderHook(() => useForm<{ name: string }>({ defaultValues: { name: 'x' } }))
      .result.current

    await act(async () => {
      await result.current.onSubmit({ name: 'x' }, form)
    })

    expect(form.getFieldState('name').error?.message).toBe('Taken')
    expect(result.current.formError).toBeNull()
  })

  it('sets footer copy when api issues are absent', async () => {
    const { result } = renderHook(() =>
      useAdoptedFormSubmit<{ name: string }>(
        vi.fn().mockRejectedValue(new Error('network')),
        'Could not save.',
      ),
    )

    const form = renderHook(() => useForm<{ name: string }>({ defaultValues: { name: 'x' } }))
      .result.current

    await act(async () => {
      await result.current.onSubmit({ name: 'x' }, form)
    })

    expect(result.current.formError).toBe('Could not save.')
  })
})
