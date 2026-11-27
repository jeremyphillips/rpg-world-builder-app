/**
 * @vitest-environment jsdom
 */
import { ApiError } from '@rpg/contracts'
import { describe, expect, it, vi } from 'vitest'
import { FormProvider, useForm } from 'react-hook-form'
import { act, render, screen } from '@testing-library/react'
import { z } from 'zod'
import {
  collectCurrentFormValidationProducerIssues,
  FormUiContext,
  type FormItem,
  type FormUiContextValue,
} from '@rpg/ui/form'
import type { ReactNode } from 'react'

import {
  ContentFormSubmitValidationFailed,
  useContentFormSubmit,
  useContentFormSubmitProducerBinding,
} from './content-form-submit'
import { CONTENT_FORM_VALIDATION_OPERATION_MESSAGE } from '../../validation/normalize-content-form-issues.lib'
import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'

const testSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  level: z.number().min(1, 'Level is required.'),
})

type TestValues = z.infer<typeof testSchema>

const resolverFields: FormItem[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'level', label: 'Level', type: 'number' },
]

const testDef = {
  schema: testSchema,
  createDefaultValues: { name: '', level: 0 },
  nameField: (): FormItem => resolverFields[0],
  buildFields: (): FormItem[] => resolverFields,
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
  fields: resolverFields,
  hasAttemptedSubmit: false,
  hasAttemptedPublish: false,
  publishPresentationIssues: [],
  publishPresentationEnabled: false,
  removeValidationSessionExpandKeys: vi.fn(),
} as unknown as FormUiContextValue

function FormUiWrapper({ children }: { children: ReactNode }) {
  return <FormUiContext.Provider value={uiValue}>{children}</FormUiContext.Provider>
}

function footerText(formError: string | undefined, rootMessage: string | undefined): string {
  return [formError, rootMessage].filter(Boolean).join(' ')
}

describe('footer ingestion boundary (Package C)', () => {
  it('maps author-correctable prepareWrite ZodError on name and level without footer leakage', async () => {
    const persist = vi.fn()
    const controls = { submit: async () => undefined as Promise<void> }
    const formRef: { current: ReturnType<typeof useForm<TestValues>> | null } = { current: null }
    const submitRef: {
      current: ReturnType<typeof useContentFormSubmit<TestValues>> | null
    } = { current: null }

    function Harness() {
      const form = useForm<TestValues>({ defaultValues: { name: 'A', level: 2 } })
      formRef.current = form
      const contentSubmit = useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: testCtx,
        fallbackMessage: 'Could not save.',
        invalidPresentation: {
          resolverFields,
          formId: 'footer-ingestion-form',
        },
        prepareWrite: () => {
          throw new z.ZodError([
            {
              code: 'too_small',
              minimum: 1,
              type: 'string',
              inclusive: true,
              message: 'Name must be present on wire.',
              path: ['name'],
            },
            {
              code: 'too_small',
              minimum: 9,
              type: 'number',
              inclusive: true,
              message: 'Level too low for wire.',
              path: ['level'],
            },
          ])
        },
        persist,
      })
      submitRef.current = contentSubmit
      controls.submit = () => contentSubmit.onSubmit({ name: 'A', level: 2 }, form)
      const Boundary = contentSubmit.ProducerBoundary

      return (
        <FormProvider {...form}>
          <Boundary>
            <div role="alert" data-testid="submit-footer">
              {footerText(contentSubmit.formError, form.formState.errors.root?.message)}
            </div>
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
        expect(error).toBeInstanceOf(ContentFormSubmitValidationFailed)
      }
    })

    expect(persist).not.toHaveBeenCalled()
    expect(submitRef.current?.formError).toBeUndefined()
    expect(formRef.current!.getFieldState('name').error?.message).toBe(
      'Name must be present on wire.',
    )
    expect(formRef.current!.getFieldState('level').error?.message).toBe('Level too low for wire.')

    const footer = screen.getByTestId('submit-footer').textContent ?? ''
    expect(footer).not.toMatch(/\[|ZodError/i)
  })

  it('keeps structured API failures on fields with a footer-safe empty hook formError', async () => {
    const persist = vi.fn().mockRejectedValue(
      new ApiError(400, 'validation_error', 'Validation failed', {
        issues: [{ path: 'name', message: 'Slug is already taken', code: 'duplicate' }],
      }),
    )
    const controls = { submit: async () => undefined as Promise<void> }
    const formRef: { current: ReturnType<typeof useForm<TestValues>> | null } = { current: null }
    const submitRef: {
      current: ReturnType<typeof useContentFormSubmit<TestValues>> | null
    } = { current: null }

    function Harness() {
      const form = useForm<TestValues>({ defaultValues: { name: 'A', level: 1 } })
      formRef.current = form
      const contentSubmit = useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: testCtx,
        fallbackMessage: 'Could not save.',
        invalidPresentation: {
          resolverFields,
          formId: 'footer-api-form',
        },
        persist,
      })
      submitRef.current = contentSubmit
      controls.submit = () => contentSubmit.onSubmit({ name: 'A', level: 1 }, form)
      const Boundary = contentSubmit.ProducerBoundary

      return (
        <FormProvider {...form}>
          <Boundary>
            <div role="alert" data-testid="submit-footer">
              {footerText(contentSubmit.formError, form.formState.errors.root?.message)}
            </div>
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
      } catch {
        /* expected */
      }
    })

    expect(submitRef.current?.formError).toBeUndefined()
    expect(formRef.current!.getFieldState('name').error?.message).toContain('Slug is already taken')
    const footer = screen.getByTestId('submit-footer').textContent ?? ''
    expect(footer).not.toMatch(/\[|validation_error/i)
  })

  it('uses fallback footer copy for plain persist errors, never raw Error.message', async () => {
    const persist = vi.fn().mockRejectedValue(new Error('Network failed'))
    const controls = { submit: async () => undefined as Promise<void> }
    const submitRef: {
      current: ReturnType<typeof useContentFormSubmit<TestValues>> | null
    } = { current: null }

    function Harness() {
      const form = useForm<TestValues>({ defaultValues: { name: 'A', level: 1 } })
      const contentSubmit = useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: testCtx,
        fallbackMessage: 'Could not save.',
        persist,
      })
      submitRef.current = contentSubmit
      controls.submit = () => contentSubmit.onSubmit({ name: 'A', level: 1 }, form)
      const Boundary = contentSubmit.ProducerBoundary

      return (
        <FormProvider {...form}>
          <Boundary>
            <div role="alert" data-testid="submit-footer">
              {contentSubmit.formError ?? ''}
            </div>
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
        expect((error as Error).message).toBe('Network failed')
      }
    })

    expect(submitRef.current?.formError).toBe('Could not save.')
    expect(submitRef.current?.formError).not.toBe('Network failed')
    expect(screen.getByTestId('submit-footer')).toHaveTextContent('Could not save.')
    expect(screen.getByTestId('submit-footer').textContent).not.toContain('Network failed')
  })

  it('surfaces safe operation copy for JSON-shaped prepare throws without raw message in footer', async () => {
    const persist = vi.fn()
    const controls = { submit: async () => undefined as Promise<void> }
    const formRef: { current: ReturnType<typeof useForm<TestValues>> | null } = { current: null }
    const submitRef: {
      current: ReturnType<typeof useContentFormSubmit<TestValues>> | null
    } = { current: null }
    const bindingRef: {
      current: ReturnType<typeof useContentFormSubmitProducerBinding> | null
    } = { current: null }

    function Harness() {
      const form = useForm<TestValues>({ defaultValues: { name: 'A', level: 2 } })
      formRef.current = form
      const binding = useContentFormSubmitProducerBinding()
      bindingRef.current = binding
      const contentSubmit = useContentFormSubmit<TestValues>({
        def: testDef,
        ctx: testCtx,
        fallbackMessage: 'Could not save.',
        producerBinding: binding,
        invalidPresentation: {
          resolverFields,
          formId: 'footer-operation-form',
        },
        prepareWrite: () => {
          throw new Error('{"secret":"raw"}')
        },
        persist,
      })
      submitRef.current = contentSubmit
      controls.submit = () => contentSubmit.onSubmit({ name: 'A', level: 2 }, form)
      const Boundary = contentSubmit.ProducerBoundary

      return (
        <FormProvider {...form}>
          <Boundary>
            <div role="alert" data-testid="submit-footer">
              {footerText(contentSubmit.formError, form.formState.errors.root?.message)}
            </div>
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
        expect(error).toBeInstanceOf(ContentFormSubmitValidationFailed)
      }
    })

    expect(persist).not.toHaveBeenCalled()
    expect(submitRef.current?.formError).toBeUndefined()

    const footer = screen.getByTestId('submit-footer').textContent ?? ''
    expect(footer).not.toContain('{"secret":"raw"}')
    expect(footer).not.toMatch(/\[|ZodError/i)

    const serializationIssues = collectCurrentFormValidationProducerIssues(
      bindingRef.current!.producerSession,
      bindingRef.current!.snapshotStamp,
    ).filter((issue) => issue.message === CONTENT_FORM_VALIDATION_OPERATION_MESSAGE)
    const rootMessage = formRef.current!.formState.errors.root?.message

    expect(serializationIssues.length + (rootMessage?.length ?? 0)).toBeGreaterThan(0)
    expect(rootMessage ?? serializationIssues[0]?.message).not.toContain('{"secret":"raw"}')
  })
})
