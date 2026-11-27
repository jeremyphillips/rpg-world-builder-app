/**
 * @vitest-environment jsdom
 */
import { ApiError } from '@rpg/contracts'
import { describe, expect, it, vi } from 'vitest'
import { FormProvider, useFieldArray, useForm, type UseFormReturn } from 'react-hook-form'
import { render, renderHook, act, waitFor, screen } from '@testing-library/react'
import { z } from 'zod'
import {
  collectCurrentFormValidationProducerIssues,
  collectTabbedFormResolverItems,
  createEmptyFormValidationProducerSession,
  FormUiContext,
  resolveTabValidationState,
  type FormItem,
  type FormUiContextValue,
  type TabbedFormTab,
} from '@rpg/ui/form'
import type { ReactNode } from 'react'

import {
  ContentFormSubmitSuperseded,
  ContentFormSubmitValidationFailed,
  presentContentFormInvalidSubmit,
  useContentFormSubmit,
  useContentFormSubmitProducerBinding,
} from './content-form-submit'
import { presentPersistValidationFailure } from './content-form-submit-presentation.lib'
import { buildIdentityPreparedWrite } from '../../submit/content-prepared-write.types'
import { projectCompactedArrayProvenance } from '../../submit/project-compacted-array-provenance.lib'
import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'
import { useContentFormPresentationIssues } from '../../validation/content-form-presentation-issues.client'

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
    expect(persist).toHaveBeenCalledWith(
      { name: 'A', level: 1 },
      form,
      expect.objectContaining({ isAttemptCurrent: expect.any(Function) }),
    )
    expect(result.current.formError).toBeUndefined()
  })

  it('persists the write-schema parsed prepare payload', async () => {
    const persist = vi.fn().mockResolvedValue(undefined)
    const writeSchema = z.object({
      name: z.string().trim(),
      level: z.coerce.number(),
    })

    const { result } = renderHook(() =>
      useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: testCtx,
        fallbackMessage: 'Could not save.',
        writeSchema,
        prepareWrite: () =>
          buildIdentityPreparedWrite({
            name: '  Hero ',
            level: '7',
          } as unknown as TestValues),
        persist,
      }),
    )

    const form = renderHook(() =>
      useForm<TestValues>({ defaultValues: { name: '  Hero ', level: 7 } }),
    ).result.current

    await act(async () => {
      await result.current.onSubmit({ name: '  Hero ', level: 7 }, form)
    })

    expect(persist).toHaveBeenCalledWith(
      { name: 'Hero', level: 7 },
      form,
      expect.objectContaining({ isAttemptCurrent: expect.any(Function) }),
    )
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
    expect(persist).toHaveBeenCalledWith(
      { name: 'A', level: 1 },
      form,
      expect.objectContaining({ isAttemptCurrent: expect.any(Function) }),
    )
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

  it('skips persist baseline sync when the attempt is stale before reset', async () => {
    let releaseFirst: () => void = () => undefined
    const persist = vi
      .fn()
      .mockImplementationOnce(
        async (
          _values: TestValues,
          form: UseFormReturn<TestValues>,
          meta?: { isAttemptCurrent?: () => boolean },
        ) => {
          await new Promise<void>((resolve) => {
            releaseFirst = resolve
          })
          if (meta?.isAttemptCurrent?.()) {
            form.reset({ name: 'Server baseline', level: 9 })
          }
        },
      )
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

    act(() => {
      harness.form.setValue('name', 'User session', { shouldDirty: true })
    })

    await act(async () => {
      releaseFirst()
      await expect(first).rejects.toBeInstanceOf(ContentFormSubmitSuperseded)
    })

    expect(harness.form.getValues('name')).toBe('User session')
  })

  it('ignores a late api rejection when a same-stamp attempt already finished', async () => {
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
    const bindingRef: {
      current: ReturnType<typeof useContentFormSubmitProducerBinding> | null
    } = { current: null }
    const controls = { submit: async () => undefined as Promise<void> }

    function Harness() {
      const form = useForm<TestValues>({ defaultValues: { name: 'A', level: 2 } })
      const binding = useContentFormSubmitProducerBinding()
      bindingRef.current = binding
      const contentSubmit = useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: { ...testCtx, mode: 'edit' },
        fallbackMessage: 'Could not save.',
        producerBinding: binding,
        invalidPresentation: {
          resolverFields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'level', label: 'Level', type: 'number' },
          ],
          formId: 'edit-form',
        },
        persist: async (values) => persist(values),
      })
      controls.submit = () => contentSubmit.onSubmit({ name: 'A', level: 2 }, form)
      const Boundary = contentSubmit.ProducerBoundary
      const StampBridge = contentSubmit.ProducerStampBridge

      return (
        <FormProvider {...form}>
          <StampBridge />
          <Boundary>
            <span data-testid="probe" />
          </Boundary>
        </FormProvider>
      )
    }

    render(
      <FormUiWrapper>
        <Harness />
      </FormUiWrapper>,
    )

    let first!: Promise<void>
    act(() => {
      first = controls.submit()
    })
    first.catch(() => undefined)
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1))

    await act(async () => {
      await controls.submit()
    })

    await act(async () => {
      releaseFirst()
      await expect(first).rejects.toBeInstanceOf(ContentFormSubmitSuperseded)
    })

    expect(persist).toHaveBeenCalledTimes(2)
    expect(
      collectCurrentFormValidationProducerIssues(
        bindingRef.current!.producerSession,
        bindingRef.current!.snapshotStamp,
      ).some((issue) => issue.path === 'name'),
    ).toBe(false)
  })

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

  it('does not badge stamp N api issues after the edit snapshot advances to N+1', async () => {
    const persist = vi.fn().mockRejectedValueOnce(
      new ApiError(400, 'validation_error', 'Invalid', {
        issues: [{ path: 'name', message: 'Slug is already taken', code: 'duplicate' }],
      }),
    )
    const bindingRef: {
      current: ReturnType<typeof useContentFormSubmitProducerBinding> | null
    } = { current: null }
    const formRef: { current: UseFormReturn<TestValues> | null } = { current: null }
    const controls = { submit: async () => undefined as Promise<void> }

    function Harness() {
      const form = useForm<TestValues>({ defaultValues: { name: 'A', level: 2 } })
      formRef.current = form
      const binding = useContentFormSubmitProducerBinding()
      bindingRef.current = binding
      const contentSubmit = useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: { ...testCtx, mode: 'edit' },
        fallbackMessage: 'Could not save.',
        producerBinding: binding,
        invalidPresentation: {
          resolverFields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'level', label: 'Level', type: 'number' },
          ],
          formId: 'edit-form',
        },
        persist: async (values) => persist(values),
      })
      controls.submit = () => contentSubmit.onSubmit({ name: 'A', level: 2 }, form)
      const Boundary = contentSubmit.ProducerBoundary
      const StampBridge = contentSubmit.ProducerStampBridge

      return (
        <FormProvider {...form}>
          <StampBridge />
          <Boundary>
            <span data-testid="probe" />
          </Boundary>
        </FormProvider>
      )
    }

    render(
      <FormUiWrapper>
        <Harness />
      </FormUiWrapper>,
    )

    await act(async () => {
      try {
        await controls.submit()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    const stampAfterFail = bindingRef.current!.snapshotStamp
    expect(
      bindingRef.current!.producerSession.slots.api?.issues.some((issue) => issue.path === 'name'),
    ).toBe(true)
    expect(
      collectCurrentFormValidationProducerIssues(
        bindingRef.current!.producerSession,
        stampAfterFail,
      ).some((issue) => issue.path === 'name'),
    ).toBe(true)

    act(() => {
      formRef.current!.setValue('name', 'Replaced', { shouldDirty: true })
    })

    await waitFor(() => {
      expect(bindingRef.current!.snapshotStamp).toBeGreaterThan(stampAfterFail)
    })

    expect(
      collectCurrentFormValidationProducerIssues(
        bindingRef.current!.producerSession,
        bindingRef.current!.snapshotStamp,
      ),
    ).toEqual([])
  })

  it('ignores a late api failure after the user resets the form mid-persist', async () => {
    let releaseFirst: () => void = () => undefined
    const persist = vi.fn().mockImplementationOnce(
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
    const formRef: { current: UseFormReturn<TestValues> | null } = { current: null }
    const controls = { submit: async () => undefined as Promise<void> }

    function Harness() {
      const form = useForm<TestValues>({ defaultValues: { name: 'A', level: 2 } })
      formRef.current = form
      const binding = useContentFormSubmitProducerBinding()
      const contentSubmit = useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: { ...testCtx, mode: 'edit' },
        fallbackMessage: 'Could not save.',
        producerBinding: binding,
        invalidPresentation: {
          resolverFields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'level', label: 'Level', type: 'number' },
          ],
          formId: 'edit-form',
        },
        persist: async (values) => persist(values),
      })
      controls.submit = () => contentSubmit.onSubmit({ name: 'A', level: 2 }, form)
      const Boundary = contentSubmit.ProducerBoundary
      const StampBridge = contentSubmit.ProducerStampBridge

      return (
        <FormProvider {...form}>
          <StampBridge />
          <Boundary>
            <span data-testid="probe" />
          </Boundary>
        </FormProvider>
      )
    }

    render(
      <FormUiWrapper>
        <Harness />
      </FormUiWrapper>,
    )

    let first!: Promise<void>
    act(() => {
      first = controls.submit()
    })
    first.catch(() => undefined)
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1))

    act(() => {
      formRef.current!.reset({ name: 'Cleared', level: 1 })
    })

    await act(async () => {
      releaseFirst()
      await expect(first).rejects.toBeInstanceOf(ContentFormSubmitSuperseded)
    })

    expect(formRef.current!.getFieldState('name').error).toBeUndefined()
  })

  it('ignores a late api failure after the user replaces values mid-persist', async () => {
    let releaseFirst: () => void = () => undefined
    const persist = vi.fn().mockImplementationOnce(
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
    const bindingRef: {
      current: ReturnType<typeof useContentFormSubmitProducerBinding> | null
    } = { current: null }
    const formRef: { current: UseFormReturn<TestValues> | null } = { current: null }
    const controls = { submit: async () => undefined as Promise<void> }

    function Harness() {
      const form = useForm<TestValues>({ defaultValues: { name: 'A', level: 2 } })
      formRef.current = form
      const binding = useContentFormSubmitProducerBinding()
      bindingRef.current = binding
      const contentSubmit = useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: { ...testCtx, mode: 'edit' },
        fallbackMessage: 'Could not save.',
        producerBinding: binding,
        invalidPresentation: {
          resolverFields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'level', label: 'Level', type: 'number' },
          ],
          formId: 'edit-form',
        },
        persist: async (values) => persist(values),
      })
      controls.submit = () => contentSubmit.onSubmit({ name: 'A', level: 2 }, form)
      const Boundary = contentSubmit.ProducerBoundary
      const StampBridge = contentSubmit.ProducerStampBridge

      return (
        <FormProvider {...form}>
          <StampBridge />
          <Boundary>
            <span data-testid="probe" />
          </Boundary>
        </FormProvider>
      )
    }

    render(
      <FormUiWrapper>
        <Harness />
      </FormUiWrapper>,
    )

    let first!: Promise<void>
    act(() => {
      first = controls.submit()
    })
    first.catch(() => undefined)
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1))

    act(() => {
      formRef.current!.setValue('name', 'Replaced mid-flight', { shouldDirty: true })
    })

    await act(async () => {
      releaseFirst()
      await expect(first).rejects.toBeInstanceOf(ContentFormSubmitSuperseded)
    })

    expect(
      collectCurrentFormValidationProducerIssues(
        bindingRef.current!.producerSession,
        bindingRef.current!.snapshotStamp,
      ),
    ).toEqual([])
    expect(formRef.current!.getFieldState('name').error).toBeUndefined()
  })

  it('surfaces serialization issues without Zod JSON in the submit footer', async () => {
    const persist = vi.fn()
    const { result } = renderHook(
      () =>
        useContentFormSubmit<TestValues>({
          def: testDef,
          ctx: testCtx,
          fallbackMessage: 'Could not save.',
          invalidPresentation: {
            resolverFields: [
              { name: 'name', label: 'Name', type: 'text' },
              { name: 'level', label: 'Level', type: 'number' },
            ],
            formId: 'serialization-form',
          },
          prepareWrite: () => {
            throw new z.ZodError([
              {
                code: 'too_small',
                minimum: 9,
                type: 'number',
                inclusive: true,
                message: 'Level too low.',
                path: ['level'],
              },
            ])
          },
          persist,
        }),
      { wrapper: FormUiWrapper },
    )

    const form = renderHook(() => useForm<TestValues>({ defaultValues: { name: 'A', level: 2 } }))
      .result.current

    await act(async () => {
      try {
        await result.current.onSubmit({ name: 'A', level: 2 }, form)
      } catch (error) {
        expect(error).toBeInstanceOf(ContentFormSubmitValidationFailed)
      }
    })

    expect(persist).not.toHaveBeenCalled()
    expect(result.current.formError).toBeUndefined()
    expect(form.getFieldState('level').error?.message).toBe('Level too low.')
  })
})

const editTabBadgesTabs: TabbedFormTab[] = [
  {
    id: 'identity',
    label: 'Identity',
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'level', label: 'Level', type: 'number' },
    ],
    errorPaths: ['name', 'level'],
  },
]
const editTabResolverFields = collectTabbedFormResolverItems(editTabBadgesTabs)

describe('edit shell tab badges from producer projection', () => {
  it('badges the tab at stamp N and clears after form reset advances the snapshot', async () => {
    const persist = vi.fn().mockRejectedValueOnce(
      new ApiError(400, 'validation_error', 'Invalid', {
        issues: [{ path: 'name', message: 'Slug is already taken', code: 'duplicate' }],
      }),
    )
    const formRef: { current: UseFormReturn<TestValues> | null } = { current: null }
    const controls = { submit: async () => undefined as Promise<void> }

    function TabBadgeProbe() {
      const { issues } = useContentFormPresentationIssues(editTabResolverFields)
      const identityCount =
        resolveTabValidationState(issues, editTabBadgesTabs, editTabResolverFields).find(
          (state) => state.tabId === 'identity',
        )?.count ?? 0
      return <output data-testid="identity-tab-count">{identityCount}</output>
    }

    function Harness() {
      const form = useForm<TestValues>({ defaultValues: { name: 'A', level: 2 } })
      formRef.current = form
      const binding = useContentFormSubmitProducerBinding()
      const contentSubmit = useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: { ...testCtx, mode: 'edit' },
        fallbackMessage: 'Could not save.',
        producerBinding: binding,
        invalidPresentation: {
          resolverFields: editTabResolverFields,
          formId: 'edit-tabbed-form',
        },
        persist: async (values) => persist(values),
      })
      controls.submit = () => contentSubmit.onSubmit({ name: 'A', level: 2 }, form)
      const Boundary = contentSubmit.ProducerBoundary
      const StampBridge = contentSubmit.ProducerStampBridge

      return (
        <FormProvider {...form}>
          <StampBridge />
          <Boundary>
            <TabBadgeProbe />
          </Boundary>
        </FormProvider>
      )
    }

    render(
      <FormUiWrapper>
        <Harness />
      </FormUiWrapper>,
    )

    await act(async () => {
      try {
        await controls.submit()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    await waitFor(() => {
      expect(screen.getByTestId('identity-tab-count')).toHaveTextContent('1')
    })

    act(() => {
      formRef.current!.reset({ name: 'Fresh start', level: 3 })
    })

    await waitFor(() => {
      expect(screen.getByTestId('identity-tab-count')).toHaveTextContent('0')
    })
  })

  it('clears stale api projection after deleting a collection row advances the snapshot', async () => {
    const grantsSchema = z.object({
      name: z.string().min(1),
      grants: z.array(z.object({ label: z.string().min(1) })),
    })
    type GrantValues = z.infer<typeof grantsSchema>
    const grantDef = {
      ...testDef,
      schema: grantsSchema,
    } as unknown as AnyContentFormDef

    const persist = vi.fn().mockRejectedValueOnce(
      new ApiError(400, 'validation_error', 'Invalid', {
        issues: [{ path: 'name', message: 'Slug is already taken', code: 'duplicate' }],
      }),
    )
    const bindingRef: {
      current: ReturnType<typeof useContentFormSubmitProducerBinding> | null
    } = { current: null }
    const controls = {
      submit: async () => undefined as Promise<void>,
      removeRow: () => undefined,
    }

    function Harness() {
      const form = useForm<GrantValues>({
        defaultValues: { name: 'A', grants: [{ label: 'One' }, { label: 'Two' }] },
      })
      const binding = useContentFormSubmitProducerBinding()
      bindingRef.current = binding
      const { remove } = useFieldArray({ control: form.control, name: 'grants' })
      controls.removeRow = () => remove(0)
      const contentSubmit = useContentFormSubmit<GrantValues>({
        def: grantDef,
        ctx: { ...testCtx, mode: 'edit' },
        fallbackMessage: 'Could not save.',
        producerBinding: binding,
        invalidPresentation: {
          resolverFields: [
            { name: 'name', label: 'Name', type: 'text' },
            {
              kind: 'array',
              name: 'grants',
              fields: [{ name: 'label', label: 'Label', type: 'text' }],
            },
          ],
          formId: 'edit-grants-form',
        },
        persist: async (values) => persist(values as unknown as TestValues),
      })
      controls.submit = () =>
        contentSubmit.onSubmit({ name: 'A', grants: [{ label: 'One' }, { label: 'Two' }] }, form)
      const Boundary = contentSubmit.ProducerBoundary
      const StampBridge = contentSubmit.ProducerStampBridge

      return (
        <FormProvider {...form}>
          <StampBridge />
          <Boundary>
            <span data-testid="probe" />
          </Boundary>
        </FormProvider>
      )
    }

    render(
      <FormUiWrapper>
        <Harness />
      </FormUiWrapper>,
    )

    await act(async () => {
      try {
        await controls.submit()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    expect(
      collectCurrentFormValidationProducerIssues(
        bindingRef.current!.producerSession,
        bindingRef.current!.snapshotStamp,
      ).some((issue) => issue.path === 'name'),
    ).toBe(true)

    act(() => {
      controls.removeRow()
    })

    await waitFor(() => {
      expect(bindingRef.current!.snapshotStamp).toBeGreaterThan(0)
      expect(
        collectCurrentFormValidationProducerIssues(
          bindingRef.current!.producerSession,
          bindingRef.current!.snapshotStamp,
        ),
      ).toEqual([])
    })
  })
})

describe('presentContentFormInvalidSubmit bridge on adopted submit', () => {
  it('sets safe retry root copy when RHF blocks without a resolvable canonical issue', () => {
    const { result } = renderHook(() =>
      useForm<TestValues>({ defaultValues: { name: 'A', level: 2 } }),
    )
    const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    act(() => {
      result.current.setError('level', { type: 'custom' })
    })

    act(() => {
      presentContentFormInvalidSubmit(result.current, uiValue, {
        resolverFields: [{ name: 'name', label: 'Name', type: 'text' }],
        formId: 'adopted-form',
      })
    })

    expect(result.current.formState.errors.root?.message).toBe(
      'Something went wrong while checking this form. Try again or refresh the page.',
    )
    expect(diagnostic).toHaveBeenCalled()
    diagnostic.mockRestore()
  })
})
