import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from '@rpg/ui/form'
import { z } from 'zod'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { RESOLUTION_FORM_FIXTURES } from '../../fixtures'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'
import { resolutionOutcomeBranchesFields } from '../../lib/form/resolution-form-slots'

import {
  optionalResolutionFormSchema,
  type ResolutionFormValues,
} from '../../lib/form/resolution-form-schema'

const outcomesSchema = z.object({
  resolution: optionalResolutionFormSchema,
})

function renderOutcomes(defaultResolution: ResolutionFormValues) {
  return render(
    <Form
      schema={outcomesSchema}
      fields={resolutionOutcomeBranchesFields()}
      defaultValues={{ resolution: defaultResolution }}
      onSubmit={() => undefined}
      rhythm="compact"
    />,
  )
}

function hitSection() {
  const heading = screen.getByRole('heading', { name: 'On hit' })
  const section = heading.closest('section')
  expect(section).not.toBeNull()
  return section!
}

describe('SpellResolutionOutcomes', () => {
  it('renders method-derived outcome groups for eldritch blast', async () => {
    renderOutcomes(RESOLUTION_FORM_FIXTURES.eldritchBlast)

    await waitFor(() => {
      expect(screen.getByRole('group', { name: /Outcome branches/ })).toBeInTheDocument()
      expect(screen.getByText(RESOLUTION_SECTION_LABELS.outcomesHint)).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'On hit' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /Damage — 1d10 Force damage/i })).toBeInTheDocument()
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
        within(expandedMissSection!).getByRole('button', {
          name: RESOLUTION_SECTION_LABELS.addOutcomeNote,
        }),
      ).toBeInTheDocument()
      expect(
        within(expandedMissSection!).queryByLabelText(RESOLUTION_SECTION_LABELS.hitNote),
      ).not.toBeInTheDocument()
    })
  })

  it('shows add additional behavior disclosure on empty hit outcomes', async () => {
    renderOutcomes(RESOLUTION_FORM_FIXTURES.eldritchBlast)

    await waitFor(() => {
      const section = hitSection()
      expect(
        within(section).getByRole('button', {
          name: RESOLUTION_SECTION_LABELS.addOutcomeNote,
        }),
      ).toBeInTheDocument()
      expect(
        within(section).queryByLabelText(RESOLUTION_SECTION_LABELS.hitNote),
      ).not.toBeInTheDocument()
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

    const appliedSection = await screen.findByText(RESOLUTION_SECTION_LABELS.appliedEffects)
    const section = appliedSection.closest('section')
    expect(section).not.toBeNull()

    await user.click(
      within(section!).getByRole('button', {
        name: RESOLUTION_SECTION_LABELS.addAppliedEffect,
      }),
    )

    expect(
      await screen.findByRole('option', { name: /Damage — 1d4 Force damage/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /1d4\+1 Force damage/i })).not.toBeInTheDocument()
  })

  it('hides the add trigger when all effects are already applied', async () => {
    renderOutcomes(RESOLUTION_FORM_FIXTURES.eldritchBlast)

    await waitFor(() => {
      expect(screen.getByRole('group', { name: /Damage — 1d10 Force damage/i })).toBeInTheDocument()
      expect(
        screen.getByText(RESOLUTION_SECTION_LABELS.outcomeAllEffectsApplied),
      ).toBeInTheDocument()
    })

    expect(
      screen.queryByRole('button', { name: RESOLUTION_SECTION_LABELS.addAppliedEffect }),
    ).not.toBeInTheDocument()
  })

  it('shows no-authored-effects copy without an add trigger', async () => {
    const resolution: ResolutionFormValues = {
      ...RESOLUTION_FORM_FIXTURES.eldritchBlast,
      effects: [],
      outcomes: RESOLUTION_FORM_FIXTURES.eldritchBlast.outcomes?.map((outcome) => ({
        ...outcome,
        applications: [],
      })),
    }

    renderOutcomes(resolution)

    await waitFor(() => {
      expect(
        screen.getByText(RESOLUTION_SECTION_LABELS.outcomeNoAuthoredEffectsAvailable),
      ).toBeInTheDocument()
      expect(
        screen.getByText(RESOLUTION_SECTION_LABELS.outcomeAuthorEffectsHint),
      ).toBeInTheDocument()
    })

    expect(
      screen.queryByRole('button', { name: RESOLUTION_SECTION_LABELS.addAppliedEffect }),
    ).not.toBeInTheDocument()
  })

  it('disables the add trigger with aria-describedby when all effects are incomplete', async () => {
    const resolution: ResolutionFormValues = {
      ...RESOLUTION_FORM_FIXTURES.eldritchBlast,
      effects: [
        {
          id: 'incomplete',
          kind: 'damage',
          roll: {},
          damageType: 'force',
        },
      ],
      outcomes: [{ result: 'hit', applications: [] }],
    }

    renderOutcomes(resolution)

    const addButton = await screen.findByRole('button', {
      name: RESOLUTION_SECTION_LABELS.addAppliedEffect,
    })
    expect(addButton).toBeDisabled()
    expect(addButton).toHaveAttribute('aria-describedby')

    const hint = document.getElementById(addButton.getAttribute('aria-describedby')!)
    expect(hint).not.toBeNull()
    expect(hint).toHaveTextContent(RESOLUTION_SECTION_LABELS.outcomeNoCompleteEffectsAvailable)
    expect(hint).toHaveTextContent(RESOLUTION_SECTION_LABELS.outcomeCompleteEffectsHint)
  })

  it('partitions unavailable effects in the add menu', async () => {
    const user = userEvent.setup()
    const resolution: ResolutionFormValues = {
      ...RESOLUTION_FORM_FIXTURES.eldritchBlast,
      effects: [
        {
          id: 'complete',
          kind: 'damage',
          roll: { dice: { count: 1, faces: 10 } },
          damageType: 'force',
        },
        {
          id: 'incomplete',
          kind: 'damage',
          roll: {},
          damageType: 'force',
        },
      ],
      outcomes: [{ result: 'hit', applications: [] }],
    }

    renderOutcomes(resolution)

    await user.click(
      screen.getByRole('button', { name: RESOLUTION_SECTION_LABELS.addAppliedEffect }),
    )

    expect(
      await screen.findByText(RESOLUTION_SECTION_LABELS.outcomeAvailableGroup),
    ).toBeInTheDocument()
    expect(screen.getByText(RESOLUTION_SECTION_LABELS.outcomeUnavailableGroup)).toBeInTheDocument()
    expect(screen.getByText('Complete the damage roll.')).toBeInTheDocument()
  })

  it('preserves incomplete application rows with disabled amount select', async () => {
    const resolution: ResolutionFormValues = {
      ...RESOLUTION_FORM_FIXTURES.eldritchBlast,
      effects: [
        {
          id: 'incomplete',
          kind: 'damage',
          roll: {},
          damageType: 'force',
        },
      ],
      outcomes: [
        {
          result: 'hit',
          applications: [{ effectId: 'incomplete', amount: 'full' }],
        },
      ],
    }

    renderOutcomes(resolution)

    await waitFor(() => {
      expect(screen.getByText(/Damage — Incomplete effect/i)).toBeInTheDocument()
      expect(screen.getByText('Complete the damage roll.')).toBeInTheDocument()
    })

    expect(screen.getByRole('combobox')).toBeDisabled()
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
      const section = hitSection()
      expect(within(section).getByDisplayValue(/can't regain Hit Points/i)).toBeInTheDocument()
    })
  })

  itAxe('has no axe accessibility violations with eldritch blast fixture', async () => {
    const { container } = renderOutcomes(RESOLUTION_FORM_FIXTURES.eldritchBlast)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'On hit' })).toBeInTheDocument()
    })

    await expectNoAxeViolations(container)
  })

  itAxe('has no axe accessibility violations with inflict wounds fixture', async () => {
    const { container } = renderOutcomes(RESOLUTION_FORM_FIXTURES.inflictWounds)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'On failed save' })).toBeInTheDocument()
    })

    await expectNoAxeViolations(container)
  })
})
