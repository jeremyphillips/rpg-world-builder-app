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
      expect(getChooseScoreButton(label)).toBeVisible()
    }
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
})
