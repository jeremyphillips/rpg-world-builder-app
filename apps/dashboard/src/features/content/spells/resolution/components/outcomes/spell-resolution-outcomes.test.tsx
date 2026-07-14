import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from '@rpg/ui/form'
import { z } from 'zod'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { RESOLUTION_FORM_FIXTURES } from '../../fixtures'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'
import {
  optionalResolutionFormSchema,
  type ResolutionFormValues,
} from '../../lib/form/resolution-form-schema'
import { SpellResolutionOutcomes } from './spell-resolution-outcomes.client'

const outcomesSchema = z.object({
  resolution: optionalResolutionFormSchema,
})

function renderOutcomes(defaultResolution: ResolutionFormValues) {
  return render(
    <Form
      schema={outcomesSchema}
      fields={[
        {
          kind: 'slot',
          name: '_resolutionOutcomes',
          render: () => <SpellResolutionOutcomes />,
        },
      ]}
      defaultValues={{ resolution: defaultResolution }}
      onSubmit={() => undefined}
      rhythm="compact"
    />,
  )
}

describe('SpellResolutionOutcomes', () => {
  it('renders method-derived outcome groups for eldritch blast', async () => {
    renderOutcomes(RESOLUTION_FORM_FIXTURES.eldritchBlast)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'On hit' })).toBeInTheDocument()
      expect(screen.getByText(RESOLUTION_SECTION_LABELS.outcomesHint)).toBeInTheDocument()
      expect(screen.getByText(/Damage — 1d10 Force damage/i)).toBeInTheDocument()
    })
  })

  it('collapses empty miss outcome until configured', async () => {
    const user = userEvent.setup()
    renderOutcomes(RESOLUTION_FORM_FIXTURES.eldritchBlast)

    await waitFor(() => {
      expect(screen.getByText(RESOLUTION_SECTION_LABELS.outcomeEmptySummary)).toBeInTheDocument()
    })

    const missSection = screen.getByRole('heading', { name: 'On miss' }).closest('section')
    expect(missSection).not.toBeNull()
    expect(
      within(missSection!).queryByLabelText(RESOLUTION_SECTION_LABELS.hitNote),
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: RESOLUTION_SECTION_LABELS.configureMissOutcome }),
    )

    await waitFor(() => {
      const expandedMissSection = screen
        .getByRole('heading', { name: 'On miss' })
        .closest('section')
      expect(expandedMissSection).not.toBeNull()
      expect(
        within(expandedMissSection!).getByLabelText(RESOLUTION_SECTION_LABELS.hitNote),
      ).toBeInTheDocument()
    })
  })

  it('lists only unapplied effects in the add menu', async () => {
    const user = userEvent.setup()
    const resolution = {
      ...RESOLUTION_FORM_FIXTURES.magicMissile,
      effects: [
        ...RESOLUTION_FORM_FIXTURES.magicMissile.effects,
        {
          id: 'bonus-force',
          kind: 'damage' as const,
          roll: { dice: { count: 1, faces: 4 as const } },
          damageType: 'force' as const,
        },
      ],
    }

    renderOutcomes(resolution)

    const appliedSection = await screen.findByRole('heading', { name: 'Applied automatically' })
    const section = appliedSection.closest('section')
    expect(section).not.toBeNull()

    await user.click(
      within(section!).getByRole('button', {
        name: RESOLUTION_SECTION_LABELS.addOutcomeApplication,
      }),
    )

    expect(
      await screen.findByRole('option', { name: /Damage — 1d4 Force damage/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /1d4\+1 Force damage/i })).not.toBeInTheDocument()
  })

  it('hides already-applied effects from the add menu', async () => {
    renderOutcomes(RESOLUTION_FORM_FIXTURES.eldritchBlast)

    await waitFor(() => {
      expect(screen.getByText(/Damage — 1d10 Force damage/i)).toBeInTheDocument()
    })

    expect(
      screen.queryByRole('button', { name: RESOLUTION_SECTION_LABELS.addOutcomeApplication }),
    ).not.toBeInTheDocument()
  })

  it('renders failed and successful save groups for inflict wounds', async () => {
    renderOutcomes(RESOLUTION_FORM_FIXTURES.inflictWounds)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'On failed save' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'On successful save' })).toBeInTheDocument()
    })
  })

  it('shows chill touch additional behavior on the hit outcome', async () => {
    renderOutcomes(RESOLUTION_FORM_FIXTURES.chillTouch)

    await waitFor(() => {
      const hitSection = screen.getByRole('heading', { name: 'On hit' }).closest('section')
      expect(hitSection).not.toBeNull()
      expect(within(hitSection!).getByDisplayValue(/can't regain Hit Points/i)).toBeInTheDocument()
    })
  })

  it('has no axe accessibility violations with eldritch blast fixture', async () => {
    const { container } = renderOutcomes(RESOLUTION_FORM_FIXTURES.eldritchBlast)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'On hit' })).toBeInTheDocument()
    })

    await expectNoAxeViolations(container)
  })

  it('has no axe accessibility violations with inflict wounds fixture', async () => {
    const { container } = renderOutcomes(RESOLUTION_FORM_FIXTURES.inflictWounds)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'On failed save' })).toBeInTheDocument()
    })

    await expectNoAxeViolations(container)
  })
})
