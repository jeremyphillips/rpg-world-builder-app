import { renderHook, act } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { useSubmitHandler } from './use-submit-handler.client'

describe('useSubmitHandler', () => {
  it('clears the previous error before a new submit', async () => {
    let attempt = 0

    const { result } = renderHook(() =>
      useSubmitHandler<{ name: string }>({
        submit: async () => {
          attempt += 1
          if (attempt === 1) throw new Error('First failure')
        },
        fallbackMessage: 'Could not save.',
      }),
    )

    const form = renderHook(() => useForm<{ name: string }>({ defaultValues: { name: '' } }))
    await act(async () => {
      await result.current.onSubmit({ name: 'A' }, form.result.current)
    })
    expect(result.current.formError).toBe('First failure')

    await act(async () => {
      await result.current.onSubmit({ name: 'B' }, form.result.current)
    })
    expect(result.current.formError).toBeUndefined()
  })

  it('maps unknown thrown values to the fallback message', async () => {
    const { result } = renderHook(() =>
      useSubmitHandler<{ name: string }>({
        submit: async () => {
          throw 'nope'
        },
        fallbackMessage: 'Could not save.',
      }),
    )

    const form = renderHook(() => useForm<{ name: string }>({ defaultValues: { name: '' } }))
    await act(async () => {
      await result.current.onSubmit({ name: 'A' }, form.result.current)
    })

    expect(result.current.formError).toBe('Could not save.')
  })

  it('prefers mapError over Error.message', async () => {
    const { result } = renderHook(() =>
      useSubmitHandler<{ name: string }>({
        submit: async () => {
          throw new Error('Raw message')
        },
        fallbackMessage: 'Could not save.',
        mapError: () => 'Mapped message',
      }),
    )

    const form = renderHook(() => useForm<{ name: string }>({ defaultValues: { name: '' } }))
    await act(async () => {
      await result.current.onSubmit({ name: 'A' }, form.result.current)
    })

    expect(result.current.formError).toBe('Mapped message')
  })
})
