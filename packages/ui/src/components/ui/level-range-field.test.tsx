import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { LevelRangeField } from './level-range-field.client'

const OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
]

describe('LevelRangeField', () => {
  it('renders min and max selects with a connector', () => {
    render(
      <LevelRangeField
        id="tier-range"
        label="Level range"
        minId="tier-range-min"
        maxId="tier-range-max"
        minValue={1}
        maxValue={4}
        minOptions={OPTIONS}
        maxOptions={OPTIONS}
        size="sm"
        required
      />,
    )

    expect(screen.getByText('Level range')).toBeInTheDocument()
    expect(screen.getByText('through')).toHaveClass('text-xs')
    expect(screen.getByLabelText('Level range minimum')).toBeInTheDocument()
    expect(screen.getByLabelText('Level range maximum')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <LevelRangeField
        id="tier-range"
        label="Level range"
        minId="tier-range-min"
        maxId="tier-range-max"
        minValue={1}
        maxValue={4}
        minOptions={OPTIONS}
        maxOptions={OPTIONS}
        required
      />,
    )

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
