/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { render, act, waitFor } from '@testing-library/react'
import { z } from 'zod'
import {
  FormUiContext,
  FormValidationProducerProvider,
  type FormItem,
  type FormUiContextValue,
} from '@rpg/ui/form'
import type { ReactNode } from 'react'

import {
  useContentFormSubmit,
  useContentFormSubmitProducerBinding,
  ContentFormSubmitValidationFailed,
} from '../shells/submit/content-form-submit'
import { resolveContentPublishSchema } from '../shells/edit/content-edit-load'
import { useContentFormPresentationIssues } from './content-form-presentation-issues.client'
import { ContentFormPublishValidationBridge } from './content-form-publish-validation.client'
import { ingestContentFormValidationIssues } from './ingest-content-form-validation.lib'
import type { AnyContentFormDef, ContentFormCtx } from '../registry/content-form-registry'
import type { TabbedFormTab } from '@rpg/ui/form'

const draftSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
})

const publishSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
})

type Values = z.infer<typeof draftSchema>

const fields: FormItem[] = [{ name: 'name', label: 'Name', type: 'text' }]
const tabs: TabbedFormTab[] = [{ id: 'basics', label: 'Basics', fields, errorPaths: ['name'] }]

const def = {
  schema: publishSchema,
  draftSchema,
  createDefaultValues: { name: '' },
  nameField: (): FormItem => ({ name: 'name', label: 'Name', type: 'text' }),
  buildFields: (): FormItem[] => fields,
} as unknown as AnyContentFormDef

const ctx = { campaignId: 'camp-1', mode: 'create' } as ContentFormCtx

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

function noopPublishIssuesChange() {}

describe('adopted content producer mounted presentation', () => {
  it('projects publish-action slot issues after a failed submit', async () => {
    const persist = vi.fn()
    const probeRef: { current: ReturnType<typeof useContentFormPresentationIssues> | null } = {
      current: null,
    }

    type HarnessHandle = {
      form: UseFormReturn<Values>
      submit: () => Promise<void>
    }
    const handle = {} as HarnessHandle

    function Probe() {
      probeRef.current = useContentFormPresentationIssues(fields)
      return null
    }

    function Harness() {
      const form = useForm<Values>({ defaultValues: { name: '' } })
      const contentSubmit = useContentFormSubmit<Values>({
        def,
        ctx,
        fallbackMessage: 'Could not save.',
        persist: async (values) => persist(values),
      })
      handle.form = form
      handle.submit = () => contentSubmit.onSubmit({ name: '' }, form)
      const Boundary = contentSubmit.ProducerBoundary

      return (
        <FormProvider {...form}>
          <Boundary>
            <Probe />
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
        await handle.submit()
      } catch (error) {
        expect(error).toBeInstanceOf(ContentFormSubmitValidationFailed)
      }
    })

    await waitFor(() => {
      expect(probeRef.current?.issues.some((issue) => issue.path === 'name')).toBe(true)
    })
    expect(persist).not.toHaveBeenCalled()
  })

  // Shared `useContentFormSubmitProducerBinding` + manual `replaceSlot` ingress (edit shell
  // wraps the same binding inside `ProducerBoundary` once stamp watch is mounted).
  it('clears only publish-readiness after advisory success while draft-action stays', async () => {
    const persist = vi.fn()
    const probeRef: { current: ReturnType<typeof useContentFormPresentationIssues> | null } = {
      current: null,
    }
    const bindingRef: { current: ReturnType<typeof useContentFormSubmitProducerBinding> | null } = {
      current: null,
    }
    const controls = {
      draft: async () => undefined as Promise<void>,
      fixName: () => undefined,
    }

    type HarnessHandle = {
      form: UseFormReturn<Values>
    }
    const handle = {} as HarnessHandle

    function Probe() {
      probeRef.current = useContentFormPresentationIssues(fields)
      return (
        <span data-testid="paths">
          {probeRef.current.issues.map((issue) => issue.path).join(',')}
        </span>
      )
    }

    function Harness() {
      const form = useForm<Values>({ defaultValues: { name: '' } })
      const binding = useContentFormSubmitProducerBinding()
      bindingRef.current = binding
      handle.form = form

      const draft = useContentFormSubmit<Values>({
        def,
        ctx,
        commitValidationIntent: 'draft',
        fallbackMessage: 'Could not save draft.',
        producerBinding: binding,
        mountProducerChrome: false,
        persist,
      })

      controls.draft = () => draft.onSubmit({ name: '' }, form)
      controls.fixName = () => {
        form.setValue('name', 'Saved name', { shouldDirty: true })
      }

      const replaceSlot = (
        slot: Parameters<typeof ingestContentFormValidationIssues>[1],
        issues: Parameters<typeof ingestContentFormValidationIssues>[3],
      ) => {
        binding.setProducerSession((prev) =>
          ingestContentFormValidationIssues(prev, slot, binding.stampRef.current, issues),
        )
      }
      const publishSchemaForRail = resolveContentPublishSchema(def, ctx)

      return (
        <FormProvider {...form}>
          <FormValidationProducerProvider
            session={binding.producerSession}
            stamp={binding.snapshotStamp}
            replaceSlot={replaceSlot}
          >
            <ContentFormPublishValidationBridge
              schema={publishSchemaForRail}
              tabs={tabs}
              onValidationChange={() => {}}
            />
            <Probe />
          </FormValidationProducerProvider>
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
        await controls.draft()
      } catch (error) {
        expect(error).toBeInstanceOf(ContentFormSubmitValidationFailed)
      }
    })

    await waitFor(() => {
      expect(probeRef.current?.issues.some((issue) => issue.path === 'name')).toBe(true)
      expect(
        bindingRef.current?.producerSession.slots['draft-action']?.issues.length,
      ).toBeGreaterThan(0)
    })

    await waitFor(() => {
      expect(
        bindingRef.current?.producerSession.slots['publish-readiness']?.issues.length ?? 0,
      ).toBeGreaterThan(0)
    })

    act(() => {
      controls.fixName()
    })

    await waitFor(
      () => {
        expect(bindingRef.current?.producerSession.slots['publish-readiness']?.issues).toEqual([])
        expect(
          bindingRef.current?.producerSession.slots['draft-action']?.issues.length,
        ).toBeGreaterThan(0)
        expect(probeRef.current?.issues.some((issue) => issue.path === 'name')).toBe(true)
      },
      { timeout: 2000 },
    )
  })

  it('adopted ProducerBoundary keeps draft-action while publish-readiness clears on edit', async () => {
    const persist = vi.fn()
    const probeRef: { current: ReturnType<typeof useContentFormPresentationIssues> | null } = {
      current: null,
    }
    const bindingRef: { current: ReturnType<typeof useContentFormSubmitProducerBinding> | null } = {
      current: null,
    }
    const controls = {
      draft: async () => undefined as Promise<void>,
      fixName: () => undefined,
    }
    type HarnessHandle = {
      form: UseFormReturn<Values>
    }
    const handle = {} as HarnessHandle

    function Probe() {
      probeRef.current = useContentFormPresentationIssues(fields)
      return null
    }

    function Harness() {
      const form = useForm<Values>({ defaultValues: { name: '' } })
      const binding = useContentFormSubmitProducerBinding()
      bindingRef.current = binding
      handle.form = form

      const draft = useContentFormSubmit<Values>({
        def,
        ctx,
        commitValidationIntent: 'draft',
        fallbackMessage: 'Could not save draft.',
        producerBinding: binding,
        mountProducerChrome: false,
        persist,
      })
      const publish = useContentFormSubmit<Values>({
        def,
        ctx,
        fallbackMessage: 'Could not publish.',
        producerBinding: binding,
        invalidPresentation: { resolverFields: fields, formId: 'pilot-form' },
        persist,
      })

      controls.draft = () => draft.onSubmit({ name: '' }, form)
      controls.fixName = () => {
        form.setValue('name', 'Saved name', { shouldDirty: true })
      }

      const Boundary = publish.ProducerBoundary
      const publishSchemaForRail = resolveContentPublishSchema(def, ctx)

      return (
        <FormProvider {...form}>
          <Boundary>
            <ContentFormPublishValidationBridge
              schema={publishSchemaForRail}
              tabs={tabs}
              onValidationChange={noopPublishIssuesChange}
            />
            <Probe />
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
        await controls.draft()
      } catch (error) {
        expect(error).toBeInstanceOf(ContentFormSubmitValidationFailed)
      }
    })

    await waitFor(() => {
      expect(
        bindingRef.current?.producerSession.slots['draft-action']?.issues.length,
      ).toBeGreaterThan(0)
      expect(
        bindingRef.current?.producerSession.slots['publish-readiness']?.issues.length ?? 0,
      ).toBeGreaterThan(0)
    })

    const stampBeforeEdit = bindingRef.current!.snapshotStamp

    act(() => {
      controls.fixName()
    })

    await waitFor(
      () => {
        expect(bindingRef.current?.producerSession.slots['publish-readiness']?.issues).toEqual([])
      },
      { timeout: 2000 },
    )

    expect(bindingRef.current!.snapshotStamp).toBeGreaterThanOrEqual(stampBeforeEdit)

    // Slot keeps the draft attempt batch; publish-readiness alone cleared at the new stamp.
    expect(
      bindingRef.current?.producerSession.slots['draft-action']?.issues.length,
    ).toBeGreaterThan(0)
    expect(persist).not.toHaveBeenCalled()
  })
})
