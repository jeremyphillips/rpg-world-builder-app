import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { RadioCard } from './radio-card.client'

const options = [
  {
    label: 'Modern 5e',
    value: '5e',
    description: 'A familiar modern fantasy rules framework.',
    meta: ['Ascending AC', 'Proficiency bonus'],
  },
  {
    label: 'Modern 3e',
    value: '3e',
    description: 'A detailed d20 framework with ascending armor class.',
    meta: ['Ascending AC', 'Attack bonuses'],
  },
]

describe('RadioCard', () => {
  it('selects an option on click', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <RadioCard aria-label="Edition preset" options={options} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('radio', { name: /Modern 3e/i }))
    expect(onValueChange).toHaveBeenCalledWith('3e')
  })

  it('marks the selected option as checked', () => {
    render(<RadioCard aria-label="Edition preset" options={options} value="5e" />)
    expect(screen.getByRole('radio', { name: /Modern 5e/i })).toBeChecked()
  })

  it('renders meta chips for each option', () => {
    render(<RadioCard aria-label="Edition preset" options={options} />)
    expect(screen.getByText('Proficiency bonus')).toBeInTheDocument()
    expect(screen.getByText('Attack bonuses')).toBeInTheDocument()
  })

  it('renders an inline title badge when provided', () => {
    render(
      <RadioCard
        aria-label="Edition preset"
        options={[{ label: 'Modern 5e', value: '5e', badge: 'Recommended' }]}
      />,
    )
    expect(screen.getByText('Recommended')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<RadioCard aria-label="Edition preset" options={options} />)
    await expectNoAxeViolations(container)
  })

  it('selects an option when controlPosition is right', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <RadioCard
        aria-label="Edition preset"
        options={options}
        controlPosition="right"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('radio', { name: /Modern 3e/i }))
    expect(onValueChange).toHaveBeenCalledWith('3e')
  })
})
