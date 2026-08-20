/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { useForm } from 'react-hook-form'
import { renderHook, act } from '@testing-library/react'
import { z } from 'zod'
import { FormUiContext, type FormItem, type FormUiContextValue } from '@rpg/ui/form'
import type { ReactNode } from 'react'

import {
  ContentFormSubmitValidationFailed,
  presentContentFormInvalidSubmit,
  useContentFormSubmit,
} from './content-form-submit'
import type { AnyContentFormDef, ContentFormCtx } from '../content-form-registry'

const testSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  level: z.number().min(1, 'Level is required.'),
})

type TestValues = z.infer<typeof testSchema>

const testDef = {
  schema: testSchema,
  createDefaultValues: { name: '', level: 0 },
  nameField: (): FormItem => ({ name: 'name', label: 'Name', type: 'text' }),
  buildFields: (): FormItem[] => [{ name: 'level', label: 'Level', type: 'number' }],
} as unknown as AnyContentFormDef

const testCtx = { campaignId: 'camp-1', mode: 'create' } as ContentFormCtx

const uiValue = {
  markSubmitAttempted: vi.fn(),
  addValidationSessionExpandKeys: vi.fn(),
  validationSessionExpandKeys: new Set<string>(),
  clearValidationSessionExpandKeys: vi.fn(),
  isSubmitAttempted: false,
  validationPresentation: 'progressive' as const,
  fields: [],
  hasAttemptedSubmit: false,
  removeValidationSessionExpandKeys: vi.fn(),
} as FormUiContextValue

function FormUiWrapper({ children }: { children: ReactNode }) {
  return <FormUiContext.Provider value={uiValue}>{children}</FormUiContext.Provider>
}

describe('presentContentFormInvalidSubmit', () => {
  it('calls navigateInvalidSubmit helpers when ui is available', () => {
    const { result } = renderHook(() =>
      useForm<TestValues>({ defaultValues: { name: '', level: 0 } }),
    )

    act(() => {
      result.current.setError('name', { type: 'manual', message: 'Name is required.' })
    })

    act(() => {
      presentContentFormInvalidSubmit(result.current, uiValue, {
        resolverFields: [
          { name: 'name', label: 'Name', type: 'text' },
          { name: 'level', label: 'Level', type: 'number' },
        ],
        formId: 'test-form',
        resolveViewForPath: () => 'details',
        activateView: vi.fn(),
      })
    })

    expect(uiValue.markSubmitAttempted).toHaveBeenCalled()
  })

  it('calls activateView even when ui is unavailable', () => {
    const activateView = vi.fn()
    const { result } = renderHook(() =>
      useForm<TestValues>({ defaultValues: { name: '', level: 0 } }),
    )

    act(() => {
      presentContentFormInvalidSubmit(
        result.current,
        null,
        {
          resolverFields: [{ name: 'name', label: 'Name', type: 'text' }],
          formId: 'test-form',
          resolveViewForPath: () => 'details',
          activateView,
        },
        { firstInvalidPath: 'name' },
      )
    })

    expect(activateView).toHaveBeenCalledWith('details')
  })
})

describe('useContentFormSubmit', () => {
  it('rejects without calling persist when commit validation fails', async () => {
    const persist = vi.fn()

    const { result } = renderHook(() =>
      useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: testCtx,
        fallbackMessage: 'Could not save.',
        invalidPresentation: {
          resolverFields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'level', label: 'Level', type: 'number' },
          ],
          formId: 'test-form',
        },
        persist,
      }),
    )

    const form = renderHook(() => useForm<TestValues>({ defaultValues: { name: '', level: 0 } }))
      .result.current

    await expect(
      act(async () => {
        await result.current.onSubmit({ name: '', level: 0 }, form)
      }),
    ).rejects.toBeInstanceOf(ContentFormSubmitValidationFailed)

    expect(persist).not.toHaveBeenCalled()
    expect(result.current.formError).toBeUndefined()
    expect(form.getFieldState('name').error?.message).toBeTruthy()
  })

  it('calls persist once and resolves on success', async () => {
    const persist = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: testCtx,
        fallbackMessage: 'Could not save.',
        persist,
      }),
    )

    const form = renderHook(() => useForm<TestValues>({ defaultValues: { name: 'A', level: 1 } }))
      .result.current

    await act(async () => {
      await result.current.onSubmit({ name: 'A', level: 1 }, form)
    })

    expect(persist).toHaveBeenCalledOnce()
    expect(result.current.formError).toBeUndefined()
  })

  it('sets formError and rejects when persist throws', async () => {
    const persist = vi.fn().mockRejectedValue(new Error('Network failed'))

    const { result } = renderHook(() =>
      useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: testCtx,
        fallbackMessage: 'Could not save.',
        persist,
      }),
    )

    const form = renderHook(() => useForm<TestValues>({ defaultValues: { name: 'A', level: 1 } }))
      .result.current

    let caught: unknown
    await act(async () => {
      try {
        await result.current.onSubmit({ name: 'A', level: 1 }, form)
      } catch (error) {
        caught = error
      }
    })

    expect(caught).toBeInstanceOf(Error)
    expect((caught as Error).message).toBe('Network failed')
    expect(result.current.formError).toBe('Network failed')
  })

  it('captures FormUiContext via UiBridge for invalid presentation', async () => {
    const persist = vi.fn()
    const activateView = vi.fn()

    const { result } = renderHook(
      () =>
        useContentFormSubmit<TestValues>({
          def: testDef,
          ctx: testCtx,
          fallbackMessage: 'Could not save.',
          invalidPresentation: {
            resolverFields: [{ name: 'name', label: 'Name', type: 'text' }],
            formId: 'test-form',
            resolveViewForPath: () => 'details',
            activateView,
          },
          persist,
        }),
      { wrapper: FormUiWrapper },
    )

    renderHook(() => result.current.UiBridge(), { wrapper: FormUiWrapper })

    const form = renderHook(() => useForm<TestValues>({ defaultValues: { name: '', level: 0 } }))
      .result.current

    vi.mocked(uiValue.markSubmitAttempted).mockClear()

    await expect(
      act(async () => {
        await result.current.onSubmit({ name: '', level: 0 }, form)
      }),
    ).rejects.toBeInstanceOf(ContentFormSubmitValidationFailed)

    expect(uiValue.markSubmitAttempted).toHaveBeenCalled()
    expect(persist).not.toHaveBeenCalled()
  })
})
