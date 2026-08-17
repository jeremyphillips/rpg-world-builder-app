import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { RadioCardField } from './radio-card-field'

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

describe('RadioCardField', () => {
  it('selects an option and reports the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <RadioCardField
        id="edition-preset"
        label="Edition preset"
        options={options}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('radio', { name: /Modern 3e/i }))
    expect(onValueChange).toHaveBeenCalledWith('3e')
  })

  it('labels the group and surfaces the error', () => {
    render(
      <RadioCardField
        id="edition-preset"
        label="Edition preset"
        options={options}
        error="Required."
      />,
    )
    expect(screen.getByRole('radiogroup', { name: 'Edition preset' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Required.')
  })

  it('stretches the card group to the full field width', () => {
    const { container } = render(
      <RadioCardField id="edition-preset" label="Edition preset" options={options} />,
    )

    expect(container.querySelector('[role="radiogroup"]')).toHaveClass('w-full')
  })

  it('renders grouped sections with eyebrows when optionGroups are provided', () => {
    render(
      <RadioCardField
        id="class-choice"
        label="Class"
        options={options}
        optionGroups={[
          {
            id: 'recommended',
            eyebrow: 'Recommended for this organization',
            options: [options[0]!],
          },
          {
            id: 'all-classes',
            eyebrow: 'All classes',
            options: [options[1]!],
          },
        ]}
      />,
    )

    expect(screen.getByText('Recommended for this organization')).toBeInTheDocument()
    expect(screen.getByText('All classes')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Modern 5e/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Modern 3e/i })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <RadioCardField id="edition-preset" label="Edition preset" options={options} />,
    )
    await expectNoAxeViolations(container)
  })
})
