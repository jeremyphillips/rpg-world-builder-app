import { beforeAll, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext } from 'react-hook-form'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  DEFAULT_ABILITY_GENERATION_RULES,
  DEFAULT_STANDARD_ARRAY,
  characterBuilderAbilityRecommendationMessages,
  formatFieldMessage,
} from '@rpg/contracts'
import { Form } from '@rpg/ui/form'

import { abilitiesFormSchema } from '../../../../../lib/steps/abilities-form-fields'
import { FixedScoresAssignment } from './fixed-scores-assignment'

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

const fighterRecommendation = {
  classInput: {
    className: 'Fighter',
    primaryAbilities: ['str', 'dex'] as const,
  },
  recommendation: {
    preferences: [
      { ability: 'str', source: 'class', emphasis: 'primary', className: 'Fighter' },
      { ability: 'dex', source: 'class', emphasis: 'secondary', className: 'Fighter' },
    ],
    suggestedAssignment: { str: 15, dex: 14 },
  },
}

function renderAssignment(
  defaultValues: Record<string, number | undefined> = {},
  options: {
    showInvalidStates?: boolean
    classInput?: (typeof fighterRecommendation)['classInput'] | null
    recommendation?: (typeof fighterRecommendation)['recommendation'] | null
  } = {},
  onSubmit: (values: Record<string, unknown>) => void = vi.fn(),
) {
  return render(
    <Form
      schema={abilitiesFormSchema}
      fields={[
        {
          kind: 'slot',
          name: 'fixedScoresAssignment',
          render: () => (
            <FixedScoresAssignment
              scorePool={DEFAULT_ABILITY_GENERATION_RULES.standardArray}
              showInvalidStates={options.showInvalidStates}
              classInput={options.classInput ?? null}
              recommendation={options.recommendation ?? null}
            />
          ),
        },
      ]}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    />,
  )
}

function getScorePoolSection() {
  return screen.getByRole('region', { name: 'Available scores' })
}

function getAutoFillButton() {
  return screen.getByRole('button', {
    name: formatFieldMessage(characterBuilderAbilityRecommendationMessages.autoFillRemaining()),
  })
}

function getClearScoresButton() {
  return screen.getByRole('button', {
    name: formatFieldMessage(characterBuilderAbilityRecommendationMessages.clearScores()),
  })
}

function getChooseScoreTrigger(abilityLabel: string) {
  return screen.getByRole('button', { name: `Choose ${abilityLabel} score` })
}

function getChangeScoreTrigger(abilityLabel: string) {
  return screen.getByRole('button', { name: `Change ${abilityLabel} score` })
}

describe('FixedScoresAssignment', () => {
  it('shows the score pool in a dashed container when nothing is assigned', () => {
    const { container } = renderAssignment()

    expect(screen.getByRole('heading', { name: 'Fixed scores' })).toBeInTheDocument()
    expect(
      screen.getByText('Drag each score onto an ability, or choose scores manually.'),
    ).toBeInTheDocument()

    const pool = within(getScorePoolSection())
    expect(pool.getByText('6 scores remaining')).toBeInTheDocument()
    expect(container.querySelector('.ui-inset-panel--dashed')).toBeInTheDocument()

    for (const score of DEFAULT_STANDARD_ARRAY) {
      expect(pool.getByRole('button', { name: `Score ${score}` })).toBeInTheDocument()
    }
  })

  it('does not show invalid card styling before a failed continue attempt', () => {
    const { container } = renderAssignment()
    expect(container.querySelector('[class*="border-destructive"]')).not.toBeInTheDocument()
  })

  it('shows invalid styling on unassigned cards after a failed continue attempt', () => {
    const { container } = renderAssignment({}, { showInvalidStates: true })
    expect(container.querySelectorAll('[class*="border-destructive"]').length).toBeGreaterThan(0)
  })

  it('assigns a score via choose score, updates the pool, and shows the modifier', async () => {
    renderAssignment()

    await userEvent.click(getChooseScoreTrigger('Strength'))
    await userEvent.click(screen.getByRole('radio', { name: '15' }))

    await waitFor(() => {
      expect(screen.getByText('5 scores remaining')).toBeInTheDocument()
    })

    expect(getScorePoolSection().textContent).not.toContain('15')
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('moves a score from another ability via the popover', async () => {
    renderAssignment({ str: 15 })

    await userEvent.click(getChooseScoreTrigger('Dexterity'))
    await userEvent.click(screen.getByRole('radio', { name: 'Move from Strength, 15' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Dexterity score 15' })).toBeInTheDocument()
      expect(getChooseScoreTrigger('Strength')).toBeInTheDocument()
    })
    expect(getScorePoolSection().textContent).not.toContain('15')
  })

  it('swaps scores between abilities via the popover', async () => {
    renderAssignment({ str: 15, dex: 14 })

    await userEvent.click(getChangeScoreTrigger('Dexterity'))
    await userEvent.click(screen.getByRole('radio', { name: 'Swap with Strength, 15' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Dexterity score 15' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Strength score 14' })).toBeInTheDocument()
    })
  })

  it('marks the form dirty after the first popover assignment', async () => {
    function DirtyProbe() {
      const form = useFormContext()
      return <span data-testid="form-dirty">{String(form.formState.isDirty)}</span>
    }

    render(
      <Form
        schema={abilitiesFormSchema}
        fields={[
          {
            kind: 'slot',
            name: 'fixedScoresAssignment',
            render: () => (
              <>
                <DirtyProbe />
                <FixedScoresAssignment scorePool={DEFAULT_ABILITY_GENERATION_RULES.standardArray} />
              </>
            ),
          },
        ]}
        defaultValues={{}}
        onSubmit={vi.fn()}
      />,
    )

    await userEvent.click(getChooseScoreTrigger('Strength'))
    await userEvent.click(screen.getByRole('radio', { name: '15' }))

    await waitFor(() => {
      expect(screen.getByTestId('form-dirty')).toHaveTextContent('true')
    })
  })

  it('keeps the dashed pool container visible when all values are assigned', () => {
    const { container } = renderAssignment({
      str: 15,
      dex: 14,
      con: 13,
      int: 12,
      wis: 10,
      cha: 8,
    })

    const pool = within(getScorePoolSection())
    expect(pool.getByText('All scores assigned')).toBeInTheDocument()
    expect(pool.queryByRole('button', { name: /Score \d+/ })).not.toBeInTheDocument()
    expect(container.querySelector('.ui-inset-panel--dashed')).toBeInTheDocument()
  })

  it('shows choose on empty cards and change on filled cards', () => {
    renderAssignment({ str: 15 })

    expect(getChangeScoreTrigger('Strength')).toBeVisible()
    expect(getChooseScoreTrigger('Dexterity')).toBeVisible()
  })

  it('opens the popover from the pencil trigger', async () => {
    renderAssignment({ str: 15 })

    await userEvent.click(getChangeScoreTrigger('Strength'))
    expect(screen.getByText('Choose a score')).toBeInTheDocument()
  })

  it('does not open the popover after a drag past the activation distance', async () => {
    renderAssignment()

    const poolToken = within(getScorePoolSection()).getByRole('button', { name: 'Score 15' })
    fireEvent.pointerDown(poolToken, { clientX: 0, clientY: 0, pointerId: 1, isPrimary: true })
    fireEvent.pointerMove(poolToken, { clientX: 20, clientY: 0, pointerId: 1, isPrimary: true })
    fireEvent.pointerUp(poolToken, { clientX: 20, clientY: 0, pointerId: 1, isPrimary: true })

    expect(screen.queryByRole('heading', { name: 'Choose a score' })).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderAssignment({ str: 15, con: 13 })

    await expectNoAxeViolations(container)
  })

  it('shows class recommendations and suggested assignment when a class is selected', () => {
    renderAssignment({}, fighterRecommendation)

    expect(
      screen.getByText(
        formatFieldMessage(
          characterBuilderAbilityRecommendationMessages.heading({ className: 'Fighter' }),
        ),
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: formatFieldMessage(characterBuilderAbilityRecommendationMessages.apply()),
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/are useful for Fighters\./)).toBeInTheDocument()
    expect(screen.getByText(/Suggested: 15 → Strength, 14 → Dexterity/)).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: /Recommended primary ability for Fighter/ }),
    ).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /Also useful for Fighter/ })).toHaveLength(1)
  })

  it('labels the action Replace with suggestions when existing assignments conflict', () => {
    renderAssignment({ cha: 15 }, fighterRecommendation)

    expect(
      screen.getByRole('button', {
        name: formatFieldMessage(characterBuilderAbilityRecommendationMessages.replace()),
      }),
    ).toBeInTheDocument()
  })

  it('shows disabled Applied when current assignments match the suggestion', () => {
    renderAssignment({ str: 15, dex: 14 }, fighterRecommendation)

    expect(
      screen.getByRole('button', {
        name: formatFieldMessage(characterBuilderAbilityRecommendationMessages.applied()),
      }),
    ).toBeDisabled()
    expect(
      screen.queryByRole('button', {
        name: formatFieldMessage(characterBuilderAbilityRecommendationMessages.apply()),
      }),
    ).not.toBeInTheDocument()
  })

  it('applies suggestions while preserving unrelated assignments', async () => {
    renderAssignment({ cha: 15, wis: 10 }, fighterRecommendation)

    await userEvent.click(
      screen.getByRole('button', {
        name: formatFieldMessage(characterBuilderAbilityRecommendationMessages.replace()),
      }),
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Strength score 15' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Dexterity score 14' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Wisdom score 10' })).toBeInTheDocument()
    })

    expect(getChooseScoreTrigger('Charisma')).toBeInTheDocument()
    expect(
      within(getScorePoolSection()).queryByRole('button', { name: 'Score 15' }),
    ).not.toBeInTheDocument()
  })

  it('shows auto-fill remaining when a class is selected and scores remain', () => {
    renderAssignment({}, fighterRecommendation)

    expect(getAutoFillButton()).toBeInTheDocument()
    expect(getAutoFillButton()).toBeVisible()
  })

  it('hides auto-fill remaining when no class is selected', () => {
    renderAssignment()

    expect(
      screen.queryByRole('button', {
        name: formatFieldMessage(characterBuilderAbilityRecommendationMessages.autoFillRemaining()),
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: formatFieldMessage(characterBuilderAbilityRecommendationMessages.clearScores()),
      }),
    ).not.toBeInTheDocument()
  })

  it('shows clear scores when all scores are assigned and a class is selected', () => {
    renderAssignment({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }, fighterRecommendation)

    expect(getClearScoresButton()).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: formatFieldMessage(characterBuilderAbilityRecommendationMessages.autoFillRemaining()),
      }),
    ).not.toBeInTheDocument()
  })

  it('clears all assignments when clear scores is clicked', async () => {
    renderAssignment({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }, fighterRecommendation)

    await userEvent.click(getClearScoresButton())

    await waitFor(() => {
      expect(screen.getByText('6 scores remaining')).toBeInTheDocument()
    })

    const pool = within(getScorePoolSection())
    for (const score of DEFAULT_STANDARD_ARRAY) {
      expect(pool.getByRole('button', { name: `Score ${score}` })).toBeInTheDocument()
    }
  })

  it('auto-fills empty abilities without changing existing assignments', async () => {
    renderAssignment({ con: 15 }, fighterRecommendation)

    await userEvent.click(getAutoFillButton())

    await waitFor(() => {
      expect(screen.getByText('All scores assigned')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Constitution score 15' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Strength score 14' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dexterity score 13' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Intelligence score \d+/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Wisdom score \d+/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Charisma score \d+/ })).toBeInTheDocument()
  })

  it('can clear and auto-fill again after all scores are assigned', async () => {
    renderAssignment({}, fighterRecommendation)

    await userEvent.click(getAutoFillButton())
    await waitFor(() => {
      expect(getClearScoresButton()).toBeInTheDocument()
    })

    await userEvent.click(getClearScoresButton())
    await waitFor(() => {
      expect(getAutoFillButton()).toBeInTheDocument()
      expect(screen.getByText('6 scores remaining')).toBeInTheDocument()
    })

    await userEvent.click(getAutoFillButton())
    await waitFor(() => {
      expect(getClearScoresButton()).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Strength score 15' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Dexterity score 14' })).toBeInTheDocument()
    })
  })
})
