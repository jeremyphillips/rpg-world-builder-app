/**
 * @vitest-environment jsdom
 *
 * Production entry: feat Form + useContentFormSubmit blocks publish persist.
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import {
  Form,
  FormUiProvider,
  useFormValidationProducerContext,
  collectCurrentFormValidationProducerIssues,
  isFormValidationProducerSlotStale,
} from '@rpg/ui/form'

import { makeContentFormCtx, TEST_CAMPAIGN_ID } from '../../lib/fixtures/content-form-ctx'
import { resolveContentFormNavigationFields } from '../../lib/forms/shells/host/content-form-host-projection'
import {
  useContentFormSubmit,
  useContentFormSubmitProducerBinding,
} from '../../lib/forms/shells/submit/content-form-submit'
import { buildFeatFields, createFeatFormSchema, type FeatFormValues } from './feat-form-fields'
import { featFormDef } from './feat-form-def'
import { featCreateDefaultValues } from './feat-form-values'
import { newRequirementGroup } from './requirement-editor-form-schema'

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

function ProducerInteractiveIssueProbe() {
  const producer = useFormValidationProducerContext()
  if (!producer) {
    return <output data-testid="interactive-issue-count">0</output>
  }
  const interactive = producer.session.slots.interactive
  const count =
    interactive && !isFormValidationProducerSlotStale(interactive, producer.stamp)
      ? interactive.issues.length
      : collectCurrentFormValidationProducerIssues(producer.session, producer.stamp).length
  return <output data-testid="interactive-issue-count">{count}</output>
}

function renderFeatCreatePipeline(defaultValues?: Partial<FeatFormValues>) {
  const ctx = makeContentFormCtx({ campaignId: TEST_CAMPAIGN_ID, mode: 'create' })
  const fields = buildFeatFields(ctx)
  const resolverFields = resolveContentFormNavigationFields(featFormDef, ctx, fields)
  const schema = createFeatFormSchema(ctx.campaignRules?.maxCharacterLevel)
  const formKey = `feat-create-${TEST_CAMPAIGN_ID}`
  const persist = vi.fn()

  const values = {
    ...featCreateDefaultValues,
    name: 'Test Feat',
    category: 'general' as const,
    prerequisiteEditor: { groups: [newRequirementGroup()] },
    ...defaultValues,
  } as FeatFormValues

  function Harness() {
    const producerBinding = useContentFormSubmitProducerBinding()
    const { onSubmit, formError, ProducerBoundary } = useContentFormSubmit<FeatFormValues>({
      def: featFormDef,
      ctx,
      producerBinding,
      fallbackMessage: 'Could not create feats.',
      invalidPresentation: {
        resolverFields,
        formId: formKey,
      },
      prepareWrite: () => {
        throw new Error('prepareWrite must not run when commit validation blocks save')
      },
      persist,
    })

    return (
      <FormUiProvider fields={resolverFields} publishPresentationEnabled>
        <Form
          id={formKey}
          schema={schema}
          fields={fields}
          defaultValues={values}
          onSubmit={onSubmit}
          formError={formError ?? undefined}
          validationPresentation="progressive"
          producerBoundary={ProducerBoundary}
          footer={(form) => (
            <>
              <ProducerInteractiveIssueProbe />
              <button
                type="button"
                onClick={() => {
                  void onSubmit(form.getValues(), form).catch(() => undefined)
                }}
              >
                Create feat
              </button>
            </>
          )}
        />
      </FormUiProvider>
    )
  }

  const view = render(<Harness />)
  return { persist, ...view }
}

describe('feat create validation pipeline', () => {
  it('blocks persist and surfaces prerequisite issues through the adopted commit path', async () => {
    const user = userEvent.setup()
    const { persist } = renderFeatCreatePipeline()

    await user.click(screen.getByRole('button', { name: 'Create feat' }))

    await waitFor(() => {
      expect(persist).not.toHaveBeenCalled()
      expect(Number(screen.getByTestId('interactive-issue-count').textContent)).toBeGreaterThan(0)
    })
  })
})
