/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { FormProvider, useForm } from 'react-hook-form'
import { FormSectionProvider, FormUiProvider } from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import { RESOLUTION_FORM_FIXTURES } from '../../fixtures'
import { SpellResolutionOutcomeApplicationsList } from './spell-resolution-outcome-applications-list.client'
import { outcomeApplicationsIdPrefix } from './spell-resolution-outcome-applications-list.client'
import { outcomeApplicationsFieldPath } from '../../lib/form/resolution-outcome-applications-form-fields'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'

function ApplicationsListHarness({
  defaultResolution,
  outcomeIndex = 0,
}: {
  defaultResolution: ResolutionFormValues
  outcomeIndex?: number
}) {
  const form = useForm({
    defaultValues: { resolution: defaultResolution },
  })

  return (
    <FormUiProvider>
      <FormProvider {...form}>
        <FormSectionProvider density="compact">
          <SpellResolutionOutcomeApplicationsList outcomeIndex={outcomeIndex} />
        </FormSectionProvider>
      </FormProvider>
    </FormUiProvider>
  )
}

describe('SpellResolutionOutcomeApplicationRow', () => {
  it('renders a complete application with amount select and relationship marker', async () => {
    render(<ApplicationsListHarness defaultResolution={RESOLUTION_FORM_FIXTURES.eldritchBlast} />)

    await waitFor(() => {
      expect(screen.getByText('↳')).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /Damage — 1d10 Force damage/ })).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  it('shows read-only amount copy when only full application is supported', async () => {
    const resolution = structuredClone(RESOLUTION_FORM_FIXTURES.eldritchBlast)
    resolution.effects = [
      {
        id: 'healing',
        kind: 'healing',
        roll: { dice: { count: 2, faces: 8 } },
      },
    ]
    const firstOutcome = resolution.outcomes?.[0]
    if (!firstOutcome) throw new Error('Expected outcome fixture')
    firstOutcome.applications = [{ effectId: 'healing', amount: 'full' }]

    render(<ApplicationsListHarness defaultResolution={resolution} />)

    await waitFor(() => {
      expect(screen.getByText('Full effect')).toBeInTheDocument()
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    })
  })

  it('disables amount and shows completeness copy for incomplete effects', async () => {
    const resolution = structuredClone(RESOLUTION_FORM_FIXTURES.eldritchBlast)
    resolution.effects[0] = {
      id: 'damage',
      kind: 'damage',
      roll: {},
      damageType: 'force',
    }

    render(<ApplicationsListHarness defaultResolution={resolution} />)

    await waitFor(() => {
      expect(screen.getByText('Complete the damage roll.')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeDisabled()
    })
  })

  it('renders unknown effect copy and hides amount for missing references', async () => {
    const resolution = structuredClone(RESOLUTION_FORM_FIXTURES.eldritchBlast)
    const firstApplication = resolution.outcomes?.[0]?.applications?.[0]
    if (!firstApplication) throw new Error('Expected application fixture')
    firstApplication.effectId = 'missing-effect'

    render(<ApplicationsListHarness defaultResolution={resolution} />)

    await waitFor(() => {
      expect(screen.getByText(/Unknown effect: missing-effect/)).toBeInTheDocument()
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    })
  })

  it('removes a row via the actions rail', async () => {
    const user = userEvent.setup()
    render(<ApplicationsListHarness defaultResolution={RESOLUTION_FORM_FIXTURES.eldritchBlast} />)

    const removeButton = await screen.findByRole('button', {
      name: /Remove Damage — 1d10 Force damage/i,
    })
    await user.click(removeButton)

    await waitFor(() => {
      expect(
        screen.queryByRole('group', { name: /Damage — 1d10 Force damage/ }),
      ).not.toBeInTheDocument()
    })
  })

  itAxe('has no axe accessibility violations for a complete row', async () => {
    const { container } = render(
      <ApplicationsListHarness defaultResolution={RESOLUTION_FORM_FIXTURES.eldritchBlast} />,
    )

    await waitFor(() => {
      expect(screen.getByRole('group', { name: /Damage — 1d10 Force damage/ })).toBeInTheDocument()
    })

    await expectNoAxeViolations(container)
  })
})

describe('SpellResolutionOutcomeApplicationsList ids', () => {
  it('uses the applications id prefix expected by invalid-submit navigation', () => {
    const outcomeIndex = 2
    const idPrefix = outcomeApplicationsIdPrefix(outcomeIndex)
    const itemPrefix = `${outcomeApplicationsFieldPath(outcomeIndex)}.0`

    expect(idPrefix).toBe('resolution-outcome-2-applications')
    expect(`${idPrefix}-${itemPrefix.replaceAll('.', '-')}-amount`).toBe(
      'resolution-outcome-2-applications-resolution-outcomes-2-applications-0-amount',
    )
  })
})
