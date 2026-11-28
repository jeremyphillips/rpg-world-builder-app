/**
 * @vitest-environment jsdom
 */
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import {
  FormUiProvider,
  TabbedForm,
  collectCurrentFormValidationProducerIssues,
  collectTabbedFormResolverItems,
  useTabbedFormTabValidationState,
  type FormItem,
  type TabbedFormTab,
} from '@rpg/ui/form'
import { render, screen, waitFor } from '@testing-library/react'
import type { UseFormReturn } from 'react-hook-form'

import { resolveContentPublishSchema } from '../shells/edit/content-edit-load'
import {
  useContentFormSubmit,
  useContentFormSubmitProducerBinding,
  type ContentFormSubmitProducerBinding,
} from '../shells/submit/content-form-submit'
import { ContentFormPublishValidationBridge } from './content-form-publish-validation.client'
import type { AnyContentFormDef, ContentFormCtx } from '../registry/content-form-registry'

const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
  level: z.coerce.number().min(5, 'Level must be at least 5.'),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'level', label: 'Level', type: 'number' },
]

const tabs: TabbedFormTab[] = [
  { id: 'identity', label: 'Identity', fields: [fields[0]!], errorPaths: ['name'] },
  { id: 'stats', label: 'Stats', fields: [fields[1]!], errorPaths: ['level'] },
]

const def = {
  schema,
  draftSchema: z.object({
    name: z.string().min(1, 'Name is required.'),
    level: z.coerce.number().optional(),
  }),
  createDefaultValues: { name: '', level: 2 },
  nameField: (): FormItem => fields[0]!,
  buildFields: (): FormItem[] => fields,
} as unknown as AnyContentFormDef

const ctx = { campaignId: 'camp-1', mode: 'create' } as ContentFormCtx

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

function TabBadgeProbe({ tabsToProbe }: { tabsToProbe: TabbedFormTab[] }) {
  const { tabStates, hasAttemptedPublish } = useTabbedFormTabValidationState(tabsToProbe)
  const identityCount = tabStates.find((state) => state.tabId === 'identity')?.count ?? 0
  return (
    <output data-testid="identity-tab-count">
      {identityCount}|{String(hasAttemptedPublish)}
    </output>
  )
}

describe('publish readiness and Review share producer projection', () => {
  it('badges from live readiness then Review after one adopted publish submit on the same session', async () => {
    const persist = vi.fn()
    const bindingRef: { current: ContentFormSubmitProducerBinding | null } = { current: null }
    const formRef: { current: UseFormReturn<Values> | null } = { current: null }
    const allFields = collectTabbedFormResolverItems(tabs)
    const publishSchema = resolveContentPublishSchema(def, ctx)
    const defaultValues = { name: '', level: 2 } satisfies Values
    const user = userEvent.setup()

    function Harness() {
      const binding = useContentFormSubmitProducerBinding()
      bindingRef.current = binding
      const { onSubmit, formError, ProducerBoundary } = useContentFormSubmit<Values>({
        def,
        ctx,
        fallbackMessage: 'Could not publish.',
        producerBinding: binding,
        invalidPresentation: {
          resolverFields: allFields,
          formId: 'publish-review-parity',
        },
        persist,
      })

      return (
        <FormUiProvider
          fields={allFields}
          publishPresentationEnabled
          validationPresentation="progressive"
        >
          <TabbedForm<Values>
            id="publish-review-parity"
            schema={schema}
            tabs={tabs}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            formError={formError ?? undefined}
            validationPresentation="progressive"
            publishPresentationEnabled
            producerBoundary={ProducerBoundary}
            contentWrapper={(content) => (
              <>
                {content}
                <ContentFormPublishValidationBridge
                  schema={publishSchema}
                  tabs={tabs}
                  onValidationChange={() => {}}
                />
                <TabBadgeProbe tabsToProbe={tabs} />
              </>
            )}
            footer={(form) => {
              formRef.current = form
              return (
                <button
                  type="button"
                  onClick={() => {
                    void onSubmit(form.getValues(), form).catch(() => undefined)
                  }}
                >
                  Publish
                </button>
              )
            }}
          />
        </FormUiProvider>
      )
    }

    render(<Harness />)

    await waitFor(() => {
      const binding = bindingRef.current!
      const readiness = collectCurrentFormValidationProducerIssues(
        binding.producerSession,
        binding.snapshotStamp,
      )
      expect(readiness.some((issue) => issue.path === 'name')).toBe(true)
      expect(binding.producerSession.slots['publish-readiness']?.issues.length).toBeGreaterThan(0)
    })

    const stampAfterReadiness = bindingRef.current!.snapshotStamp

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Review Identity/i })).toBeInTheDocument()
      expect(screen.getByTestId('identity-tab-count').textContent?.startsWith('1|')).toBe(true)
    })

    const binding = bindingRef.current!
    expect(binding.snapshotStamp).toBeGreaterThanOrEqual(stampAfterReadiness)

    const projection = collectCurrentFormValidationProducerIssues(
      binding.producerSession,
      binding.snapshotStamp,
    )
    expect(projection.some((issue) => issue.path === 'name')).toBe(true)
    expect(
      (binding.producerSession.slots['publish-action']?.issues.length ?? 0) +
        (binding.producerSession.slots['interactive']?.issues.length ?? 0),
    ).toBeGreaterThan(0)
    expect(binding.producerSession.slots['publish-readiness']?.issues.length).toBeGreaterThan(0)
    expect(persist).not.toHaveBeenCalled()
  })
})
