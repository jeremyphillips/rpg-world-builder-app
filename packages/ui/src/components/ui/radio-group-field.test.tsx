import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

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

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <RadioGroupField id="difficulty" label="Difficulty" options={options} />,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
