/**
 * @vitest-environment jsdom
 *
 * Production entry: same useContentFormSubmit wiring as `LocationGenericCreateForm`
 * in location-create-form.tsx.
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

import { makeContentFormCtx, TEST_CAMPAIGN_ID } from '../../../lib/fixtures/content-form-ctx'
import { contentFormFields } from '../../../lib/forms/registry/content-form-registry'
import { resolveContentFormNavigationFields } from '../../../lib/forms/shells/host/content-form-host-projection'
import {
  useContentFormSubmit,
  useContentFormSubmitProducerBinding,
} from '../../../lib/forms/shells/submit/content-form-submit'
import { fixedCreateToInitialValues } from '../../lib/create/location-create-shortcuts'
import { locationFormDef } from '../../lib/forms/location-form-def'
import type { LocationFormCtx } from '../../lib/forms/location-form-ctx'
import {
  locationDraftFormSchema,
  type LocationFormValues,
} from '../../lib/forms/location-form-fields'
import { applyLocationFixedCreateContext } from '../../lib/forms/location-form-values'

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

describe('location create invalid submit', () => {
  it('blocks publish persist on the fortification create entry', async () => {
    const user = userEvent.setup()
    const fixedCreate = { authoringType: 'fortification' as const }
    const persist = vi.fn()
    const optionsCtx = makeContentFormCtx({ campaignId: TEST_CAMPAIGN_ID, mode: 'create' })
    const locationCtx: LocationFormCtx = {
      ...optionsCtx,
      campaignId: TEST_CAMPAIGN_ID,
      mode: 'create',
      entityCatalogLayer: 'homebrew',
      fixedCreate,
    }
    const fields = contentFormFields(locationFormDef, locationCtx)
    const resolverFields = resolveContentFormNavigationFields(locationFormDef, locationCtx, fields)
    const formKey = 'location-create-fortification-test'
    const defaultValues = {
      ...locationFormDef.createDefaultValues,
      ...fixedCreateToInitialValues(fixedCreate),
      name: '',
    }

    function Harness() {
      const producerBinding = useContentFormSubmitProducerBinding()
      const { onSubmit, formError, ProducerBoundary } = useContentFormSubmit<LocationFormValues>({
        def: locationFormDef,
        ctx: locationCtx,
        producerBinding,
        fallbackMessage: 'Could not create locations.',
        invalidPresentation: {
          resolverFields,
          formId: formKey,
        },
        prepareWrite: () => {
          throw new Error('prepareWrite must not run when commit validation blocks save')
        },
        persist: async (values, form) => {
          applyLocationFixedCreateContext(values, fixedCreate)
          persist(values, form)
        },
      })

      return (
        <FormUiProvider fields={resolverFields} publishPresentationEnabled>
          <Form
            id={formKey}
            schema={locationDraftFormSchema as never}
            fields={fields}
            defaultValues={defaultValues}
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
                  Create location
                </button>
              </>
            )}
          />
        </FormUiProvider>
      )
    }

    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Create location' }))

    await waitFor(() => {
      expect(persist).not.toHaveBeenCalled()
      expect(Number(screen.getByTestId('interactive-issue-count').textContent)).toBeGreaterThan(0)
    })
  })
})
