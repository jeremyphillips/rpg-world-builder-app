import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { DEFAULT_ABILITY_GENERATION_RULES, STANDARD_ARRAY } from '@rpg/contracts'
import { Form } from '@rpg/ui/form'

import { abilitiesFormCopy } from '../../lib/steps/abilities-form-labels'
import { abilitiesFormSchema } from '../../lib/steps/abilities-form-fields'
import { StandardArrayAssignment } from './standard-array-assignment.client'

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
  onSubmit: (values: Record<string, unknown>) => void = vi.fn(),
) {
  return render(
    <Form
      schema={abilitiesFormSchema}
      fields={[
        {
          kind: 'slot',
          name: 'standardArrayAssignment',
          render: () => (
            <StandardArrayAssignment
              standardArray={DEFAULT_ABILITY_GENERATION_RULES.standardArray}
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

describe('StandardArrayAssignment', () => {
  it('shows the full score pool when nothing is assigned', () => {
    renderAssignment()

    expect(screen.getByRole('heading', { name: 'Standard Array' })).toBeInTheDocument()
    expect(screen.getByText('6 scores remaining')).toBeInTheDocument()

    const pool = within(getScorePoolSection())
    for (const score of STANDARD_ARRAY) {
      expect(pool.getByText(String(score))).toBeInTheDocument()
    }
  })

  it('assigns a score, updates the pool, and shows the modifier', async () => {
    renderAssignment()

    const strengthSelect = screen.getByRole('combobox', { name: /Strength score/i })
    await userEvent.click(strengthSelect)
    await userEvent.click(screen.getByRole('option', { name: '15' }))

    await waitFor(() => {
      expect(screen.getByText('5 scores remaining')).toBeInTheDocument()
    })

    expect(getScorePoolSection().textContent).not.toContain('15')
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('disables scores already assigned to another ability', async () => {
    renderAssignment({ str: 15 })

    const dexteritySelect = screen.getByRole('combobox', { name: /Dexterity score/i })
    await userEvent.click(dexteritySelect)

    expect(screen.getByRole('option', { name: '15 — assigned to STR' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('clears an assigned score and restores the pool', async () => {
    renderAssignment({ str: 15, dex: 14 })

    const strengthSelect = screen.getByRole('combobox', { name: /Strength score/i })
    await userEvent.click(strengthSelect)
    await userEvent.click(screen.getByRole('option', { name: '—' }))

    await waitFor(() => {
      expect(screen.getByText('5 scores remaining')).toBeInTheDocument()
    })

    const pool = within(getScorePoolSection())
    expect(pool.getByText('15')).toBeInTheDocument()
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

  it('has no axe accessibility violations', async () => {
    const { container } = renderAssignment({ str: 15, con: 13 })

    await expectNoAxeViolations(container)
  })
})
