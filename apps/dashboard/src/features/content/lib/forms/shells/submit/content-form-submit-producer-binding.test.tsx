/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { FormProvider, useForm } from 'react-hook-form'
import { render, act, waitFor } from '@testing-library/react'
import { z } from 'zod'
import {
  collectCurrentFormValidationProducerIssues,
  FormUiContext,
  type FormItem,
  type FormUiContextValue,
} from '@rpg/ui/form'
import type { ReactNode } from 'react'

import {
  useContentFormSubmit,
  useContentFormSubmitProducerBinding,
  ContentFormSubmitValidationFailed,
  type ContentFormSubmitProducerBinding,
} from './content-form-submit'
import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'

const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
  level: z.number().min(5, 'Level must be at least 5.'),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'level', label: 'Level', type: 'number' },
]

const def = {
  schema,
  draftSchema: z.object({
    name: z.string().min(1, 'Name is required.'),
    level: z.number().optional(),
  }),
  createDefaultValues: { name: '', level: 2 },
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

describe('useContentFormSubmitProducerBinding', () => {
  it('stores draft-action and publish-action issues on one shared session', async () => {
    const persist = vi.fn().mockResolvedValue(undefined)
    const bindingRef: { current: ContentFormSubmitProducerBinding | null } = { current: null }
    const controls = {
      draft: async () => undefined as Promise<void>,
      publish: async () => undefined as Promise<void>,
    }

    function Harness() {
      const form = useForm<Values>({ defaultValues: { name: '', level: 2 } })
      const binding = useContentFormSubmitProducerBinding()
      bindingRef.current = binding
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
      controls.draft = () => draft.onSubmit({ name: '', level: 2 }, form)
      controls.publish = () => publish.onSubmit({ name: '', level: 2 }, form)
      const Boundary = publish.ProducerBoundary
      const StampBridge = publish.ProducerStampBridge

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
        await controls.draft()
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
      expect(issues.some((issue) => issue.path === 'name')).toBe(true)
      expect(binding.producerSession.slots['draft-action']?.issues.length).toBeGreaterThan(0)
    })

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
      expect(binding.producerSession.slots['publish-action']?.issues.length).toBeGreaterThan(0)
    })
  })
})
