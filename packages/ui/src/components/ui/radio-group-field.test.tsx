import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { RadioGroupField } from './radio-group-field'

const options = [
  { label: 'Easy', value: 'easy' },
  { label: 'Deadly', value: 'deadly' },
]

describe('RadioGroupField', () => {
  it('selects an option and reports the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <RadioGroupField
        id="difficulty"
        label="Difficulty"
        options={options}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByLabelText('Deadly'))
    expect(onValueChange).toHaveBeenCalledWith('deadly')
  })

  it('labels the group and surfaces the error', () => {
    render(
      <RadioGroupField id="difficulty" label="Difficulty" options={options} error="Required." />,
    )
    expect(screen.getByRole('radiogroup', { name: 'Difficulty' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Required.')
  })

  it('lays options out horizontally when orientation is horizontal', () => {
    render(
      <RadioGroupField
        id="weapon-mode"
        label="Weapon proficiency mode"
        labelVisibility="srOnly"
        orientation="horizontal"
        options={[
          { label: 'Categories', value: 'categories' },
          { label: 'Individual weapons', value: 'individual' },
        ]}
      />,
    )
    expect(screen.getByRole('radiogroup', { name: 'Weapon proficiency mode' })).toHaveClass('flex')
    expect(screen.getByLabelText('Categories')).toBeInTheDocument()
    expect(screen.getByLabelText('Individual weapons')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <RadioGroupField id="difficulty" label="Difficulty" options={options} />,
    )
    await expectNoAxeViolations(container)
  })
})
