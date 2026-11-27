/**
 * @vitest-environment jsdom
 */
import { useCallback, useState } from 'react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormProvider, useForm } from 'react-hook-form'
import { render, screen, waitFor } from '@testing-library/react'
import { z } from 'zod'
import {
  FormUiProvider,
  FormValidationProducerProvider,
  TabbedForm,
  collectTabbedFormResolverItems,
  createEmptyFormValidationProducerSession,
  replaceFormValidationProducerSlot,
  useTabbedFormTabValidationState,
  type FormIssue,
  type FormItem,
  type TabbedFormTab,
  type FormValidationProducerSlot,
} from '@rpg/ui/form'

import { ingestContentFormValidationIssues } from './ingest-content-form-validation.lib'
import { ContentFormPublishValidationBridge } from './content-form-publish-validation.client'

const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
  level: z.coerce.number().min(1),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'level', label: 'Level', type: 'number' },
]

const tabs: TabbedFormTab[] = [
  { id: 'identity', label: 'Identity', fields, errorPaths: ['name'] },
  { id: 'stats', label: 'Stats', fields: [{ name: 'level', label: 'Level', type: 'number' }] },
]

function TabBadgeProbe() {
  const { tabStates, hasAttemptedPublish } = useTabbedFormTabValidationState(tabs)
  const identityCount = tabStates.find((state) => state.tabId === 'identity')?.count ?? 0
  return (
    <output data-testid="identity-tab-count">
      {identityCount}|{String(hasAttemptedPublish)}
    </output>
  )
}

describe('publish readiness and Review share producer projection', () => {
  it('badges tabs from publish-readiness before submit and Review after publish fails', async () => {
    const publishSchema = schema
    const allFields = collectTabbedFormResolverItems(tabs)
    const user = userEvent.setup()

    function ReadinessHarness() {
      const form = useForm<Values>({ defaultValues: { name: '', level: 1 } })
      const [session, setSession] = useState(() => createEmptyFormValidationProducerSession())
      const replaceSlot = useCallback(
        (slot: FormValidationProducerSlot, issues: readonly FormIssue[]) => {
          setSession((prev) => ingestContentFormValidationIssues(prev, slot, 1, issues))
        },
        [],
      )

      return (
        <FormProvider {...form}>
          <FormUiProvider
            fields={allFields}
            hasAttemptedPublish
            publishPresentationEnabled
            validationPresentation="progressive"
          >
            <FormValidationProducerProvider session={session} stamp={1} replaceSlot={replaceSlot}>
              <ContentFormPublishValidationBridge
                schema={publishSchema}
                tabs={tabs}
                onValidationChange={() => {}}
              />
              <TabBadgeProbe />
            </FormValidationProducerProvider>
          </FormUiProvider>
        </FormProvider>
      )
    }

    render(<ReadinessHarness />)

    await waitFor(() => {
      expect(screen.getByTestId('identity-tab-count')).toHaveTextContent('1|true')
    })

    let session = replaceFormValidationProducerSlot(
      createEmptyFormValidationProducerSession(),
      'publish-readiness',
      1,
      [{ path: 'name', message: 'Name is required.', severity: 'field' }],
    )
    session = replaceFormValidationProducerSlot(session, 'publish-action', 1, [
      { path: 'name', message: 'Name is required.', severity: 'field' },
    ])

    function SubmitHarness() {
      const form = useForm<Values>({ defaultValues: { name: '', level: 1 } })
      const replaceSlot = useCallback(() => {}, [])

      return (
        <FormProvider {...form}>
          <FormUiProvider
            fields={allFields}
            hasAttemptedSubmit
            hasAttemptedPublish
            publishPresentationEnabled
            validationPresentation="progressive"
          >
            <FormValidationProducerProvider session={session} stamp={1} replaceSlot={replaceSlot}>
              <TabbedForm
                id="publish-review-parity"
                schema={schema}
                tabs={tabs}
                defaultValues={{ name: '', level: 1 }}
                onSubmit={() => {}}
                footer={<button type="submit">Publish</button>}
              />
            </FormValidationProducerProvider>
          </FormUiProvider>
        </FormProvider>
      )
    }

    render(<SubmitHarness />)

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Review Identity/i })).toBeInTheDocument()
    })
  })
})
