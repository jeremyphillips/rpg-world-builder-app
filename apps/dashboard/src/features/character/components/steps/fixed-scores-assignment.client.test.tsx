import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { DEFAULT_ABILITY_GENERATION_RULES, STANDARD_ARRAY } from '@rpg/contracts'
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

function renderAssignment(
  defaultValues: Record<string, number | undefined> = {},
  options: { showInvalidStates?: boolean } = {},
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

function getChooseScoreButton(abilityLabel: string) {
  return screen.getByRole('button', {
    name: new RegExp(`${abilitiesFormCopy.chooseScore} for ${abilityLabel}`, 'i'),
  })
}

describe('FixedScoresAssignment', () => {
  it('shows the full score pool when nothing is assigned', () => {
    renderAssignment()

    expect(screen.getByRole('heading', { name: 'Fixed scores' })).toBeInTheDocument()
    expect(
      screen.getByText('Drag each score onto an ability, or choose scores manually.'),
    ).toBeInTheDocument()
    expect(screen.getByText('6 scores remaining')).toBeInTheDocument()

    const pool = within(getScorePoolSection())
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

    await userEvent.click(getChooseScoreButton('Strength'))
    await userEvent.click(screen.getByRole('menuitem', { name: '15' }))

    await waitFor(() => {
      expect(screen.getByText('5 scores remaining')).toBeInTheDocument()
    })

    expect(getScorePoolSection().textContent).not.toContain('15')
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('disables scores already assigned to another ability in choose score', async () => {
    renderAssignment({ str: 15 })

    await userEvent.click(getChooseScoreButton('Dexterity'))
    expect(screen.getByRole('menuitem', { name: '15 — assigned to STR' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('clears an assigned score and restores the pool via choose score', async () => {
    renderAssignment({ str: 15, dex: 14 })

    await userEvent.click(getChooseScoreButton('Strength'))
    await userEvent.click(screen.getByRole('menuitem', { name: '—' }))

    await waitFor(() => {
      expect(screen.getByText('5 scores remaining')).toBeInTheDocument()
    })

    const pool = within(getScorePoolSection())
    expect(pool.getByRole('button', { name: 'Score 15' })).toBeInTheDocument()
  })

  it('hides the score pool when all values are assigned', () => {
    renderAssignment({
      str: 15,
      dex: 14,
      con: 13,
      int: 12,
      wis: 10,
      cha: 8,
    })

    expect(screen.getByText('All scores assigned')).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: abilitiesFormCopy.availableScores }),
    ).not.toBeInTheDocument()
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
      expect(getChooseScoreButton(label)).toBeVisible()
    }
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderAssignment({ str: 15, con: 13 })

    await expectNoAxeViolations(container)
  })
})
