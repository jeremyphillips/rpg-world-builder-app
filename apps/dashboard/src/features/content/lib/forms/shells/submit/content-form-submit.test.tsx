/**
 * @vitest-environment jsdom
 */
import { ApiError } from '@rpg/contracts'
import { describe, expect, it, vi } from 'vitest'
import { FormProvider, useForm } from 'react-hook-form'
import { render, renderHook, act, waitFor } from '@testing-library/react'
import { z } from 'zod'
import {
  createEmptyFormValidationProducerSession,
  FormUiContext,
  type FormItem,
  type FormUiContextValue,
} from '@rpg/ui/form'
import type { ReactNode } from 'react'

import {
  ContentFormSubmitSuperseded,
  ContentFormSubmitValidationFailed,
  presentContentFormInvalidSubmit,
  useContentFormSubmit,
} from './content-form-submit'
import { presentPersistValidationFailure } from './content-form-submit-presentation.lib'
import { projectCompactedArrayProvenance } from '../../submit/project-compacted-array-provenance.lib'
import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'

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
  markPublishAttempted: vi.fn(),
  addValidationSessionExpandKeys: vi.fn(),
  validationSessionExpandKeys: new Set<string>(),
  clearValidationSessionExpandKeys: vi.fn(),
  isSubmitAttempted: false,
  validationPresentation: 'progressive' as const,
  fields: [],
  hasAttemptedSubmit: false,
  hasAttemptedPublish: false,
  publishPresentationIssues: [],
  publishPresentationEnabled: false,
  removeValidationSessionExpandKeys: vi.fn(),
} as unknown as FormUiContextValue

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
    expect(result.current.formError).not.toBe('Content form commit validation failed.')
    expect(form.getFieldState('name').error?.message).toBeTruthy()
    expect(form.getFieldState('name').error?.message).not.toMatch(/commit validation/i)
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
    expect(persist).toHaveBeenCalledWith({ name: 'A', level: 1 }, form)
    expect(result.current.formError).toBeUndefined()
  })

  it('persists prepared commit values, not raw handler values', async () => {
    const persist = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: testCtx,
        fallbackMessage: 'Could not save.',
        prepareCommitValues: (values) => ({ ...values, name: values.name.trim() }),
        persist,
      }),
    )

    const form = renderHook(() =>
      useForm<TestValues>({ defaultValues: { name: '  A  ', level: 1 } }),
    ).result.current

    await act(async () => {
      await result.current.onSubmit({ name: '  A  ', level: 1 }, form)
    })

    expect(persist).toHaveBeenCalledOnce()
    expect(persist).toHaveBeenCalledWith({ name: 'A', level: 1 }, form)
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
    // Arbitrary Error.message is never forwarded to the footer.
    expect(result.current.formError).toBe('Could not save.')
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

    const form = renderHook(() => useForm<TestValues>({ defaultValues: { name: '', level: 0 } }))
      .result.current
    const StampBridge = result.current.ProducerStampBridge
    render(
      <FormProvider {...form}>
        <StampBridge />
      </FormProvider>,
      { wrapper: FormUiWrapper },
    )

    vi.mocked(uiValue.markSubmitAttempted).mockClear()

    await expect(
      act(async () => {
        await result.current.onSubmit({ name: '', level: 0 }, form)
      }),
    ).rejects.toBeInstanceOf(ContentFormSubmitValidationFailed)

    expect(uiValue.markSubmitAttempted).toHaveBeenCalled()
    expect(uiValue.markPublishAttempted).toHaveBeenCalled()
    expect(persist).not.toHaveBeenCalled()
  })

  it('paints structured API validation issues on persist failure', async () => {
    const persist = vi.fn().mockRejectedValue(
      new ApiError(400, 'validation_error', 'Validation failed', {
        issues: [{ path: 'name', message: 'Slug is already taken', code: 'duplicate' }],
      }),
    )

    const { result } = renderHook(
      () =>
        useContentFormSubmit<TestValues>({
          def: testDef,
          ctx: testCtx,
          fallbackMessage: 'Could not save.',
          invalidPresentation: {
            resolverFields: [{ name: 'name', label: 'Name', type: 'text' }],
            formId: 'pilot-form',
          },
          persist,
        }),
      { wrapper: FormUiWrapper },
    )

    const form = renderHook(() => useForm<TestValues>({ defaultValues: { name: 'A', level: 1 } }))
      .result.current
    const StampBridge = result.current.ProducerStampBridge
    render(
      <FormProvider {...form}>
        <StampBridge />
      </FormProvider>,
      { wrapper: FormUiWrapper },
    )

    await act(async () => {
      try {
        await result.current.onSubmit({ name: 'A', level: 1 }, form)
      } catch {
        /* expected */
      }
    })

    expect(form.getFieldState('name').error?.message).toContain('Slug is already taken')
  })
})

describe('presentPersistValidationFailure provenance', () => {
  it('maps API request paths to the authoring row this attempt recorded', () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { traits: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] } }),
    )
    const error = new ApiError(400, 'validation_error', 'Invalid', {
      issues: [{ path: 'traits.0.name', message: 'Bad name', code: 'custom' }],
    })
    let session = createEmptyFormValidationProducerSession()
    act(() => {
      session = presentPersistValidationFailure(
        result.current,
        error,
        undefined,
        null,
        session,
        1,
        // rows 0 and 1 were dropped; request row 0 is authoring row 2
        projectCompactedArrayProvenance('traits', 3, (i) => i === 2),
      )
    })
    expect(result.current.getFieldState('traits.2.name').error?.message).toBe('Bad name')
    expect(result.current.getFieldState('traits.0.name').error).toBeUndefined()
  })
})

describe('useContentFormSubmit attempt identity', () => {
  type Harness = {
    submit: (values: TestValues) => Promise<void>
    form: ReturnType<typeof useForm<TestValues>>
    stampProbe: () => string | undefined
  }

  function mountHarness(persist: (values: TestValues) => Promise<void>): Harness {
    const handle = {} as Harness
    function Probe() {
      const form = useForm<TestValues>({ defaultValues: { name: 'A', level: 2 } })
      const submit = useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: testCtx,
        fallbackMessage: 'Could not save.',
        persist: async (values) => persist(values),
      })
      handle.form = form
      handle.submit = (values) => submit.onSubmit(values, form)
      handle.stampProbe = () => submit.formError
      const Boundary = submit.ProducerBoundary
      return (
        <FormProvider {...form}>
          <Boundary>
            <div data-testid="producer-child" />
          </Boundary>
        </FormProvider>
      )
    }
    render(
      <FormUiWrapper>
        <Probe />
      </FormUiWrapper>,
    )
    return handle
  }

  it('ignores a late success from a superseded same-stamp attempt', async () => {
    let releaseFirst: () => void = () => undefined
    const persist = vi
      .fn()
      .mockImplementationOnce(() => new Promise<void>((resolve) => (releaseFirst = resolve)))
      .mockResolvedValueOnce(undefined)
    const harness = mountHarness(persist)

    let first!: Promise<void>
    act(() => {
      first = harness.submit({ name: 'A', level: 2 }).catch((error) => {
        throw error
      })
    })
    first.catch(() => undefined)
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1))
    await act(async () => {
      await harness.submit({ name: 'A', level: 2 })
    })
    await act(async () => {
      releaseFirst()
      await expect(first).rejects.toBeInstanceOf(ContentFormSubmitSuperseded)
    })
    expect(persist).toHaveBeenCalledTimes(2)
    expect(harness.stampProbe()).toBeUndefined()
  })

  it('does not paint persist errors when a superseded attempt fails late', async () => {
    let releaseFirst: () => void = () => undefined
    const persist = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((_, reject) => {
            releaseFirst = () =>
              reject(
                new ApiError(400, 'validation_error', 'Invalid', {
                  issues: [{ path: 'name', message: 'Taken', code: 'duplicate' }],
                }),
              )
          }),
      )
      .mockResolvedValueOnce(undefined)
    const harness = mountHarness(persist)

    let first!: Promise<void>
    act(() => {
      first = harness.submit({ name: 'A', level: 2 })
    })
    first.catch(() => undefined)
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1))
    await act(async () => {
      await harness.submit({ name: 'A', level: 2 })
    })
    await act(async () => {
      releaseFirst()
      await expect(first).rejects.toBeInstanceOf(ContentFormSubmitSuperseded)
    })
    expect(harness.form.getFieldState('name').error).toBeUndefined()
  })

  it('supersedes an in-flight attempt when authored values change', async () => {
    let releaseFirst: () => void = () => undefined
    const persist = vi
      .fn()
      .mockImplementationOnce(() => new Promise<void>((resolve) => (releaseFirst = resolve)))
    const harness = mountHarness(persist)

    let first!: Promise<void>
    act(() => {
      first = harness.submit({ name: 'A', level: 2 })
    })
    first.catch(() => undefined)
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1))
    act(() => {
      harness.form.setValue('name', 'Changed')
    })
    await act(async () => {
      releaseFirst()
      await expect(first).rejects.toBeInstanceOf(ContentFormSubmitSuperseded)
    })
  })
})
