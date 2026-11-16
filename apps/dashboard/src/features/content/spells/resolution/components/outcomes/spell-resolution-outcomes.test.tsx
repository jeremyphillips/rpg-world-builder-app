import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabbedForm } from '@rpg/ui/form'
import { resolutionEffectIdSchema } from '@rpg/contracts'
import type { UseFormReturn } from 'react-hook-form'
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
  const formRef: { current: UseFormReturn<z.infer<typeof outcomesSchema>> | null } = {
    current: null,
  }
  const view = render(
    <TabbedForm
      schema={outcomesSchema}
      tabs={[{ id: 'outcomes', label: 'Outcomes', fields: resolutionOutcomeBranchesFields() }]}
      defaultValues={{ resolution: defaultResolution }}
      onSubmit={(values) => {
        formRef.current?.reset(values)
      }}
      header={(form) => {
        formRef.current = form
        return null
      }}
      density="compact"
    />,
  )
  return { ...view, formRef }
}

function outcomePanel(headingName: string | RegExp): HTMLElement {
  const heading = screen.getByRole('heading', { name: headingName })
  const panel = heading.closest('[aria-labelledby]')
  expect(panel).toBeInstanceOf(HTMLElement)
  return panel as HTMLElement
}

function hitSection() {
  return outcomePanel('On hit')
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

    const missSection = outcomePanel('On miss')
    expect(
      within(missSection).queryByLabelText(RESOLUTION_SECTION_LABELS.hitNote),
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: RESOLUTION_SECTION_LABELS.configureMissOutcome }),
    )

    await waitFor(() => {
      const expandedMissSection = outcomePanel('On miss')
      expect(
        within(expandedMissSection).getByRole('button', {
          name: RESOLUTION_SECTION_LABELS.addAppliedEffect,
        }),
      ).toBeInTheDocument()
      expect(
        within(expandedMissSection).queryByLabelText(RESOLUTION_SECTION_LABELS.hitNote),
      ).not.toBeInTheDocument()
    })
  })

  it('keeps add available on a hit outcome that already applies damage', async () => {
    renderOutcomes(RESOLUTION_FORM_FIXTURES.eldritchBlast)

    await waitFor(() => {
      const section = hitSection()
      expect(
        within(section).getByRole('button', {
          name: RESOLUTION_SECTION_LABELS.addAppliedEffect,
        }),
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

    const appliedSection = await screen.findByText(RESOLUTION_SECTION_LABELS.appliedEffects)
    const section = appliedSection.closest('[aria-labelledby]')
    expect(section).toBeInstanceOf(HTMLElement)

    await user.click(
      within(section as HTMLElement).getByRole('button', {
        name: RESOLUTION_SECTION_LABELS.addAppliedEffect,
      }),
    )

    expect(
      await screen.findByRole('menuitem', { name: /Damage — 1d4 Force damage/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /1d4\+1 Force damage/i })).not.toBeInTheDocument()
  })

  it('keeps add available when every library effect is already applied', async () => {
    renderOutcomes(RESOLUTION_FORM_FIXTURES.eldritchBlast)

    await waitFor(() => {
      expect(screen.getByRole('group', { name: /Damage — 1d10 Force damage/i })).toBeInTheDocument()
      expect(
        screen.getByText(RESOLUTION_SECTION_LABELS.outcomeAllEffectsApplied),
      ).toBeInTheDocument()
      expect(
        screen.getAllByRole('button', { name: RESOLUTION_SECTION_LABELS.addAppliedEffect }).length,
      ).toBeGreaterThan(0)
    })
  })

  it('shows no-authored-effects copy and still offers add', async () => {
    const resolution: ResolutionFormValues = {
      ...RESOLUTION_FORM_FIXTURES.eldritchBlast,
      effects: [],
      outcomes: RESOLUTION_FORM_FIXTURES.eldritchBlast.outcomes?.map((outcome) => ({
        ...outcome,
        effects: [],
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
      screen.getAllByRole('button', { name: RESOLUTION_SECTION_LABELS.addAppliedEffect }).length,
    ).toBeGreaterThan(0)
  })

  it('keeps add enabled when every library effect is incomplete', async () => {
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
      outcomes: [{ result: 'hit', effects: [] }],
    }

    renderOutcomes(resolution)

    const addButton = await screen.findByRole('button', {
      name: RESOLUTION_SECTION_LABELS.addAppliedEffect,
    })
    expect(addButton).toBeEnabled()
    expect(
      screen.getByText(RESOLUTION_SECTION_LABELS.outcomeNoCompleteEffectsAvailable),
    ).toBeInTheDocument()
    expect(
      screen.getByText(RESOLUTION_SECTION_LABELS.outcomeCompleteEffectsHint),
    ).toBeInTheDocument()
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
      outcomes: [{ result: 'hit', effects: [] }],
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
          effects: [{ kind: 'effect-reference', effectId: resolutionEffectIdSchema.parse('incomplete'), amount: 'full' }],
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

  it('keeps structural resolution values when outcome arrays mount', async () => {
    const resolution = RESOLUTION_FORM_FIXTURES.eldritchBlast
    const { formRef } = renderOutcomes(resolution)

    await waitFor(() => {
      expect(formRef.current?.getValues('resolution.effects')).toEqual(resolution.effects)
      expect(formRef.current?.getValues('resolution.outcomes.0.result')).toBe(
        resolution.outcomes?.[0]?.result,
      )
      expect(formRef.current?.getValues('resolution.outcomes.0.effects')).toMatchObject(
        resolution.outcomes?.[0]?.effects ?? [],
      )
    })
  })

  it('appends each new applied effect', async () => {
    const user = userEvent.setup()
    const resolution: ResolutionFormValues = {
      ...RESOLUTION_FORM_FIXTURES.eldritchBlast,
      effects: [],
      outcomes: [{ result: 'hit', effects: [] }],
    }
    const { formRef } = renderOutcomes(resolution)

    const add = await screen.findByRole('button', {
      name: RESOLUTION_SECTION_LABELS.addAppliedEffect,
    })
    await user.click(add)
    await user.click(await screen.findByRole('menuitem', { name: /^Damage$/ }))
    await user.click(add)
    await user.click(await screen.findByRole('menuitem', { name: /^Damage$/ }))

    await waitFor(() => {
      const effects = formRef.current?.getValues('resolution.outcomes.0.effects')
      expect(Array.isArray(effects) ? effects : []).toHaveLength(2)
      expect(formRef.current?.getValues('resolution.effects')).toHaveLength(2)
    })
  })

  it('removes an outcome reference without removing the library effect', async () => {
    const user = userEvent.setup()
    const { formRef } = renderOutcomes(RESOLUTION_FORM_FIXTURES.eldritchBlast)
    const section = await screen.findByRole('group', { name: /Damage — 1d10 Force damage/i })

    await user.click(within(section).getByRole('button', { name: /^Remove / }))

    await waitFor(() => {
      expect(formRef.current?.getValues('resolution.outcomes.0.effects')).toEqual([])
      expect(formRef.current?.getValues('resolution.effects')).toEqual(
        RESOLUTION_FORM_FIXTURES.eldritchBlast.effects,
      )
    })
  })

  it('exposes reorder controls for populated outcome rows', async () => {
    const resolution: ResolutionFormValues = {
      ...RESOLUTION_FORM_FIXTURES.eldritchBlast,
      outcomes: [
        {
          result: 'hit',
          effects: [
            { kind: 'note', description: 'First note' },
            { kind: 'note', description: 'Second note' },
          ],
        },
      ],
    }
    renderOutcomes(resolution)

    expect(await screen.findAllByRole('button', { name: /Drag to reorder/i })).toHaveLength(2)
  })

  it('marks the form dirty when an application amount changes and saves that value', async () => {
    const user = userEvent.setup()
    const submitted: { current: unknown } = { current: null }
    const resolution: ResolutionFormValues = {
      ...RESOLUTION_FORM_FIXTURES.eldritchBlast,
      outcomes: [
        {
          result: 'hit',
          effects: [{ kind: 'effect-reference', effectId: resolutionEffectIdSchema.parse('damage'), amount: 'full' }],
        },
      ],
    }
    const formRef: { current: UseFormReturn<z.infer<typeof outcomesSchema>> | null } = {
      current: null,
    }
    render(
      <TabbedForm
        schema={outcomesSchema}
        tabs={[{ id: 'outcomes', label: 'Outcomes', fields: resolutionOutcomeBranchesFields() }]}
        defaultValues={{ resolution }}
        header={(form) => {
          formRef.current = form
          return null
        }}
        footer={<button type="submit">Save resolution</button>}
        onSubmit={(values) => {
          submitted.current = values
        }}
        density="compact"
      />,
    )

    expect(screen.getByRole('button', { name: 'Outcomes' })).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByRole('combobox', { name: 'Amount' })).toHaveTextContent('Full effect')
    expect(document.body.textContent).toContain('Half effect')

    formRef.current?.setValue('resolution.outcomes.0.effects.0.amount', 'half', {
      shouldDirty: true,
      shouldTouch: true,
    })

    await waitFor(() => {
      expect(formRef.current?.getFieldState('resolution.outcomes.0.effects.0.amount').isDirty).toBe(
        true,
      )
    })

    await user.click(screen.getByRole('button', { name: 'Save resolution' }))

    await waitFor(() => {
      expect(submitted.current).toMatchObject({
        resolution: {
          effects: resolution.effects,
          outcomes: [
            {
              result: 'hit',
              effects: [{ kind: 'effect-reference', effectId: resolutionEffectIdSchema.parse('damage'), amount: 'half' }],
            },
          ],
        },
      })
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
