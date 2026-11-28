/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { FormProvider, useForm } from 'react-hook-form'
import { act, render, waitFor } from '@testing-library/react'
import { z } from 'zod'
import {
  collectCurrentFormValidationProducerIssues,
  FormUiContext,
  type FormItem,
  type FormUiContextValue,
} from '@rpg/ui/form'
import type { ReactNode } from 'react'

import { resolveContentPublishSchema } from '../shells/edit/content-edit-load'
import {
  useContentFormSubmit,
  useContentFormSubmitProducerBinding,
  ContentFormSubmitValidationFailed,
} from '../shells/submit/content-form-submit'
import { ContentFormPublishValidationBridge } from './content-form-publish-validation.client'
import type { AnyContentFormDef, ContentFormCtx } from '../registry/content-form-registry'
import type { TabbedFormTab } from '@rpg/ui/form'

const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
  level: z.number().min(5, 'Level must be at least 5.'),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'level', label: 'Level', type: 'number' },
]

const tabs: TabbedFormTab[] = [
  { id: 'identity', label: 'Identity', fields, errorPaths: ['name', 'level'] },
]

const def = {
  schema,
  draftSchema: z.object({
    name: z.string().min(1, 'Name is required.'),
    level: z.number().optional(),
  }),
  createDefaultValues: { name: '', level: 2 },
  nameField: (): FormItem => fields[0]!,
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
  publishPresentationEnabled: true,
  removeValidationSessionExpandKeys: vi.fn(),
} as unknown as FormUiContextValue

function FormUiWrapper({ children }: { children: ReactNode }) {
  return <FormUiContext.Provider value={uiValue}>{children}</FormUiContext.Provider>
}

describe('draft save with publish readiness still projected', () => {
  it('persists draft once while publish-action and publish-readiness stay visible for level', async () => {
    const persist = vi.fn().mockResolvedValue(undefined)
    const bindingRef: { current: ReturnType<typeof useContentFormSubmitProducerBinding> | null } = {
      current: null,
    }
    const controls = {
      draft: async (): Promise<void> => {},
      publish: async (): Promise<void> => {},
    }

    function Harness() {
      const form = useForm<Values>({ defaultValues: { name: 'Valid draft', level: 2 } })
      const binding = useContentFormSubmitProducerBinding()
      bindingRef.current = binding
      const publishSchemaForRail = resolveContentPublishSchema(def, ctx)

      const publish = useContentFormSubmit<Values>({
        def,
        ctx,
        fallbackMessage: 'Could not publish.',
        producerBinding: binding,
        persist,
      })
      const draft = useContentFormSubmit<Values>({
        def,
        ctx,
        commitValidationIntent: 'draft',
        fallbackMessage: 'Could not save draft.',
        producerBinding: binding,
        mountProducerChrome: false,
        persist,
      })

      controls.draft = () => draft.onSubmit({ name: 'Valid draft', level: 2 }, form)
      controls.publish = () => publish.onSubmit({ name: 'Valid draft', level: 2 }, form)
      const Boundary = publish.ProducerBoundary

      return (
        <FormProvider {...form}>
          <Boundary>
            <ContentFormPublishValidationBridge
              schema={publishSchemaForRail}
              tabs={tabs}
              onValidationChange={() => {}}
            />
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

    await waitFor(() => {
      const binding = bindingRef.current!
      const readiness = collectCurrentFormValidationProducerIssues(
        binding.producerSession,
        binding.snapshotStamp,
      )
      expect(readiness.some((issue) => issue.path === 'level')).toBe(true)
    })

    await act(async () => {
      await controls.draft()
    })

    expect(persist).toHaveBeenCalledTimes(1)
    expect(bindingRef.current?.producerSession.slots['draft-action']?.issues ?? []).toEqual([])

    await act(async () => {
      try {
        await controls.publish()
      } catch (error) {
        expect(error).toBeInstanceOf(ContentFormSubmitValidationFailed)
      }
    })

    await waitFor(() => {
      const binding = bindingRef.current!
      const issues = collectCurrentFormValidationProducerIssues(
        binding.producerSession,
        binding.snapshotStamp,
      )
      expect(issues.some((issue) => issue.path === 'level')).toBe(true)
      expect(binding.producerSession.slots['publish-readiness']?.issues.length).toBeGreaterThan(0)
      expect(binding.producerSession.slots['publish-action']?.issues.length).toBeGreaterThan(0)
    })
    expect(persist).toHaveBeenCalledTimes(1)
  })
})
