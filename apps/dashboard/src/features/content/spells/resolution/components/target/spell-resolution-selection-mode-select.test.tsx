import { render, screen, waitFor } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { RESOLUTION_FIELD_LABELS } from '../../lib/form/resolution-form-labels'
import { createDefaultResolutionFormValues } from '../../lib/form/resolution-form-values'
import { SpellResolutionSelectionModeSelect } from './spell-resolution-selection-mode-select.client'

function SelectionModeHarness() {
  const form = useForm({
    defaultValues: { resolution: createDefaultResolutionFormValues() },
  })

  return (
    <FormProvider {...form}>
      <SpellResolutionSelectionModeSelect />
    </FormProvider>
  )
}

describe('SpellResolutionSelectionModeSelect', () => {
  it('renders the selection mode field', async () => {
    render(<SelectionModeHarness />)

    await waitFor(() => {
      expect(screen.getByLabelText(RESOLUTION_FIELD_LABELS.selectionMode)).toBeInTheDocument()
    })
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<SelectionModeHarness />)

    await waitFor(() => {
      expect(screen.getByLabelText(RESOLUTION_FIELD_LABELS.selectionMode)).toBeInTheDocument()
    })

    await expectNoAxeViolations(container)
  })
})
