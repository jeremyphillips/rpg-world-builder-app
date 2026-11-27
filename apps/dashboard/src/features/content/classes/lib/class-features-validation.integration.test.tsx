/**
 * @vitest-environment jsdom
 */
import { useCallback, useRef, useState, type ReactNode } from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import {
  Form,
  FormValidationInteractiveProducerBridge,
  FormValidationProducerProvider,
  createEmptyFormValidationProducerSession,
  type FormIssue,
  type FormItem,
  type FormValidationProducerSlot,
} from '@rpg/ui/form'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { ingestContentFormValidationIssues } from '../../lib/forms/validation/ingest-content-form-validation.lib'
import { useMasterDetailRowValidation } from '../../lib/master-detail/master-detail-row-validation'
import { subclassFeatureItemFields } from './class-feature-form-fields'
import { createSubclassFeatureRowFormSchema } from './class-feature-row-form-schema'
import { effectiveMaxFromCtx } from '../../lib/form-options/content-campaign-rules'

const ctx = makeContentFormCtx()
const maxLevel = effectiveMaxFromCtx(ctx)

const schema = z.object({
  features: z.array(createSubclassFeatureRowFormSchema(maxLevel)),
})

const featureArrayField = {
  kind: 'array' as const,
  name: 'features',
  fields: subclassFeatureItemFields(ctx),
}

function RowIssueCountProbe() {
  const { getRowIssueCount } = useMasterDetailRowValidation(
    'features',
    subclassFeatureItemFields(ctx),
  )
  return <div data-testid="row-issue-count">{getRowIssueCount(0)}</div>
}

function liveProducerBoundary(resolverFields: FormItem[]) {
  return function ProducerBoundary({ children }: { children: ReactNode }) {
    const [session, setSession] = useState(() => createEmptyFormValidationProducerSession())
    const stampRef = useRef(1)
    const replaceSlot = useCallback(
      (slot: FormValidationProducerSlot, issues: readonly FormIssue[]) => {
        setSession((prev) =>
          ingestContentFormValidationIssues(prev, slot, stampRef.current, issues),
        )
      },
      [],
    )

    return (
      <FormValidationProducerProvider
        session={session}
        stamp={stampRef.current}
        replaceSlot={replaceSlot}
      >
        <FormValidationInteractiveProducerBridge fields={resolverFields} />
        {children}
      </FormValidationProducerProvider>
    )
  }
}

describe('class feature master-detail validation pilot', () => {
  it('surfaces missing name on the row after submit through the interactive producer', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const ProducerBoundary = liveProducerBoundary([featureArrayField])

    render(
      <Form
        schema={schema}
        fields={[featureArrayField]}
        producerBoundary={ProducerBoundary}
        defaultValues={{
          features: [
            {
              name: '',
              level: 1,
              grants: [],
            },
          ],
        }}
        onSubmit={onSubmit}
        footer={
          <>
            <RowIssueCountProbe />
            <button type="submit">Save</button>
          </>
        }
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(Number(screen.getByTestId('row-issue-count').textContent)).toBeGreaterThan(0)
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
