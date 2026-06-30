import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, type FieldValues, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { useAdvisoryFormSubmit } from './use-advisory-form-submit'

type Values = FieldValues & { mode?: string; mastery?: string }

function createForm(): UseFormReturn<Values> {
  const { result } = renderHook(() => useForm<Values>())
  return result.current
}

describe('useAdvisoryFormSubmit', () => {
  it('passes through to onSubmit when disabled', async () => {
    const onSubmit = vi.fn(async () => {})
    const { result } = renderHook(() =>
      useAdvisoryFormSubmit(onSubmit, {
        enabled: false,
        blockSubmit: () => true,
        getAdvisories: () => [{ message: 'Blocked' }],
      }),
    )

    const form = createForm()
    await act(async () => {
      await result.current.onSubmit({ mode: 'ranged' }, form)
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('blocks submit when blockSubmit returns true', async () => {
    const onSubmit = vi.fn(async () => {})
    const { result } = renderHook(() =>
      useAdvisoryFormSubmit(onSubmit, {
        blockSubmit: () => true,
      }),
    )

    const form = createForm()
    await act(async () => {
      await result.current.onSubmit({ mode: 'ranged' }, form)
    })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('opens confirm dialog instead of submitting when advisories remain', async () => {
    const onSubmit = vi.fn(async () => {})
    const { result } = renderHook(() =>
      useAdvisoryFormSubmit(onSubmit, {
        getAdvisories: () => [{ message: 'Reach is incompatible.' }],
        formatConfirmDescription: () => 'Reach is incompatible. Save anyway?',
        confirmLabel: 'Save anyway',
      }),
    )

    const form = createForm()
    await act(async () => {
      await result.current.onSubmit({ mode: 'ranged', properties: ['reach'] }, form)
    })

    expect(onSubmit).not.toHaveBeenCalled()
    render(<>{result.current.confirmDialog}</>)
    expect(screen.getByText('Reach is incompatible. Save anyway?')).toBeInTheDocument()
  })

  it('submits after the user confirms advisories', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(async () => {})
    const { result } = renderHook(() =>
      useAdvisoryFormSubmit(onSubmit, {
        getAdvisories: () => [{ message: 'Reach is incompatible.' }],
        formatConfirmDescription: () => 'Reach is incompatible. Save anyway?',
        confirmLabel: 'Save anyway',
      }),
    )

    const form = createForm()
    const values = { mode: 'ranged', properties: ['reach'] }

    await act(async () => {
      await result.current.onSubmit(values, form)
    })

    render(<>{result.current.confirmDialog}</>)
    await user.click(screen.getByRole('button', { name: 'Save anyway' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(values, form)
  })

  it('submits immediately when there are no advisories or blocks', async () => {
    const onSubmit = vi.fn(async () => {})
    const { result } = renderHook(() =>
      useAdvisoryFormSubmit(onSubmit, {
        blockSubmit: () => false,
        getAdvisories: () => [],
      }),
    )

    const form = createForm()
    const values = { mode: 'melee', mastery: 'vex' }

    await act(async () => {
      await result.current.onSubmit(values, form)
    })

    expect(onSubmit).toHaveBeenCalledWith(values, form)
  })
})
