import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  DEFAULT_ABILITY_GENERATION_RULES,
  STANDARD_ARRAY,
  characterBuilderAbilityRecommendationMessages,
  formatFieldMessage,
} from '@rpg/contracts'
import { Form } from '@rpg/ui/form'

import { abilitiesFormCopy } from '../../lib/steps/abilities-form-labels'
import { abilitiesFormSchema } from '../../lib/steps/abilities-form-fields'
import { FixedScoresAssignment } from './fixed-scores-assignment.client'

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
    primary: ['str'] as const,
    secondary: ['dex'] as const,
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
  return screen.getByRole('region', { name: abilitiesFormCopy.availableScores })
}

function getScoreActionButton(
  abilityLabel: string,
  actionLabel: string = abilitiesFormCopy.chooseScore,
) {
  return screen.getByRole('button', {
    name: new RegExp(`${actionLabel} for ${abilityLabel}`, 'i'),
  })
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
    expect(container.querySelector('.border-dashed')).toBeInTheDocument()

    for (const score of STANDARD_ARRAY) {
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

    await userEvent.click(getScoreActionButton('Strength'))
    await userEvent.click(screen.getByRole('menuitem', { name: '15' }))

    await waitFor(() => {
      expect(screen.getByText('5 scores remaining')).toBeInTheDocument()
    })

    expect(getScorePoolSection().textContent).not.toContain('15')
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('disables scores already assigned to another ability in choose score', async () => {
    renderAssignment({ str: 15 })

    await userEvent.click(getScoreActionButton('Dexterity'))
    expect(screen.getByRole('menuitem', { name: '15 — assigned to STR' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('clears an assigned score and restores the pool via choose score', async () => {
    renderAssignment({ str: 15, dex: 14 })

    await userEvent.click(getScoreActionButton('Strength', abilitiesFormCopy.changeScore))
    await userEvent.click(screen.getByRole('menuitem', { name: '—' }))

    await waitFor(() => {
      expect(screen.getByText('5 scores remaining')).toBeInTheDocument()
    })

    const pool = within(getScorePoolSection())
    expect(pool.getByRole('button', { name: 'Score 15' })).toBeInTheDocument()
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
    expect(container.querySelector('.border-dashed')).toBeInTheDocument()
  })

  it('keeps choose score visible for every ability card', () => {
    renderAssignment()

    for (const label of [
      'Strength',
      'Dexterity',
      'Constitution',
      'Intelligence',
      'Wisdom',
      'Charisma',
    ]) {
      expect(getScoreActionButton(label)).toBeVisible()
    }
  })

  it('shows change score when an ability already has a value', () => {
    renderAssignment({ str: 15 })

    expect(getScoreActionButton('Strength', abilitiesFormCopy.changeScore)).toBeVisible()
    expect(getScoreActionButton('Dexterity')).toBeVisible()
  })

  it('renders drop placeholders without grab affordance on empty cards', () => {
    renderAssignment()

    const placeholders = screen.getAllByText(abilitiesFormCopy.dropScoreHere)
    expect(placeholders).toHaveLength(6)
    for (const placeholder of placeholders) {
      expect(placeholder).not.toHaveClass('cursor-grab')
      expect(placeholder.closest('button')).toBeNull()
    }
  })

  it('uses token surface for pool scores and plain surface for assigned scores at rest', () => {
    renderAssignment({ str: 15 })

    const poolToken = within(getScorePoolSection()).getByRole('button', { name: 'Score 14' })
    expect(poolToken).toHaveClass('bg-secondary', 'border-border')

    const assignedScore = screen.getByRole('button', { name: 'Strength score 15' })
    expect(assignedScore).toHaveClass('bg-transparent', 'px-0', 'w-fit', 'hover:px-4', 'hover:py-2')
    expect(assignedScore).not.toHaveClass('bg-secondary')
  })

  it('has no axe accessibility violations', async () => {
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
    expect(screen.getByText(/Suggested: 15 → Strength, 14 → Dexterity\./)).toBeInTheDocument()
    expect(
      screen.getAllByText(
        formatFieldMessage(characterBuilderAbilityRecommendationMessages.badgePrimary()),
      ),
    ).toHaveLength(1)
    expect(
      screen.getAllByText(
        formatFieldMessage(characterBuilderAbilityRecommendationMessages.badgeSecondary()),
      ),
    ).toHaveLength(1)
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

    expect(screen.queryByRole('button', { name: /Charisma score/ })).not.toBeInTheDocument()
    expect(
      within(getScorePoolSection()).queryByRole('button', { name: 'Score 15' }),
    ).not.toBeInTheDocument()
  })
})
