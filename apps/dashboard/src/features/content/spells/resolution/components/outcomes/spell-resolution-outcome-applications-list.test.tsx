/**
 * @vitest-environment jsdom
 */
import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import {
  buildFieldRendererIds,
  FormSectionProvider,
  FormUiProvider,
  performInvalidSubmitFocus,
} from '@rpg/ui/form'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { RESOLUTION_FORM_FIXTURES } from '../../fixtures'
import {
  outcomeApplicationAmountField,
  outcomeApplicationsFieldPath,
} from '../../lib/form/resolution-outcome-applications-form-fields'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { SpellResolutionOutcomeApplicationsList } from './spell-resolution-outcome-applications-list.client'
import { outcomeApplicationsIdPrefix } from './spell-resolution-outcome-applications-list.client'

function InvalidSubmitHarness({ defaultResolution }: { defaultResolution: ResolutionFormValues }) {
  const form = useForm({
    defaultValues: { resolution: defaultResolution },
  })

  React.useEffect(() => {
    form.setError(`${outcomeApplicationsFieldPath(0)}.0.amount`, {
      type: 'custom',
      message: 'Select a valid application amount.',
    })
  }, [form])

  const amountId = buildFieldRendererIds(
    outcomeApplicationAmountField,
    outcomeApplicationsIdPrefix(0),
    `${outcomeApplicationsFieldPath(0)}.0`,
  ).id

  return (
    <FormUiProvider>
      <FormProvider {...form}>
        <FormSectionProvider size="sm" rhythm="compact">
          <SpellResolutionOutcomeApplicationsList outcomeIndex={0} />
        </FormSectionProvider>
        <button
          type="button"
          onClick={() => {
            performInvalidSubmitFocus(
              {
                firstIssue: {
                  path: `${outcomeApplicationsFieldPath(0)}.0.amount`,
                  message: 'Select a valid application amount.',
                  severity: 'field',
                  itemPrefix: `${outcomeApplicationsFieldPath(0)}.0`,
                  relativePath: 'amount',
                },
                expandKeys: [],
                focusControlId: amountId,
              },
              outcomeApplicationsIdPrefix(0),
            )
          }}
        >
          Focus amount
        </button>
      </FormProvider>
    </FormUiProvider>
  )
}

describe('SpellResolutionOutcomeApplicationsList invalid-submit navigation', () => {
  it('focuses the custom row amount control by buildFieldRendererIds', async () => {
    render(<InvalidSubmitHarness defaultResolution={RESOLUTION_FORM_FIXTURES.eldritchBlast} />)

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    screen.getByRole('button', { name: /focus amount/i }).click()

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('combobox'))
    })
  })
})
