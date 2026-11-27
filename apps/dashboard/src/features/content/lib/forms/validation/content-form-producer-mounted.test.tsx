/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { render, act, waitFor } from '@testing-library/react'
import { z } from 'zod'
import { FormUiContext, type FormItem, type FormUiContextValue } from '@rpg/ui/form'
import type { ReactNode } from 'react'

import {
  useContentFormSubmit,
  ContentFormSubmitValidationFailed,
} from '../shells/submit/content-form-submit'
import { useContentFormPresentationIssues } from './content-form-presentation-issues.client'
import type { AnyContentFormDef, ContentFormCtx } from '../registry/content-form-registry'

const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [{ name: 'name', label: 'Name', type: 'text' }]

const def = {
  schema,
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
      const StampBridge = contentSubmit.ProducerStampBridge

      return (
        <FormProvider {...form}>
          <StampBridge />
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
})
