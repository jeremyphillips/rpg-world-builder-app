import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  SelectionOptionCard,
  SelectionOptionCardHeaderAction,
} from './selection-option-card.client'
import { selectionOptionCardHeaderActionClasses } from './selection-option-card.variants'
import { optionCardSelectedChromeClasses } from './selection-option-card.variants'

describe('SelectionOptionCard', () => {
  it('renders header slots, label, description, and summary lines', () => {
    render(
      <SelectionOptionCard
        selected
        headerStartSlot={<span>Eyebrow</span>}
        headerEndSlot={<SelectionOptionCardHeaderAction label="Change" onClick={() => undefined} />}
        label="Equipment package A"
        description="Includes shield and sword."
        summaryLines={['Gold: 10 gp', 'Items: 3']}
      />,
    )

    expect(screen.getByText('Eyebrow')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
    expect(screen.getByText('Equipment package A')).toBeInTheDocument()
    expect(screen.getByText('Includes shield and sword.')).toBeInTheDocument()
    expect(screen.getByText('Gold: 10 gp')).toBeInTheDocument()
  })

  it('renders compact header actions without ad-hoc sizing overrides', () => {
    render(
      <SelectionOptionCard
        selected
        headerEndSlot={
          <SelectionOptionCardHeaderAction label="Change package" onClick={() => undefined} />
        }
        label="Selected package"
      />,
    )

    const action = screen.getByRole('button', { name: 'Change package' })
    expect(action.className).toContain(selectionOptionCardHeaderActionClasses)
    expect(action.className).toContain('h-control-action-compact')
    expect(action.className).not.toContain('h-auto')
  })

  it('applies shared selected chrome classes when selected', () => {
    const { container } = render(
      <SelectionOptionCard selected label="Selected package" summaryLines={['Line one']} />,
    )

    const shell = container.firstElementChild
    for (const token of optionCardSelectedChromeClasses.split(' ')) {
      expect(shell).toHaveClass(token)
    }
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <SelectionOptionCard
        selected
        label="Equipment package A"
        description="Includes shield and sword."
        summaryLines={['Gold: 10 gp']}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
