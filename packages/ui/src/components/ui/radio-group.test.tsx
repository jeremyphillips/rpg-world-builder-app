import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { RadioGroup, RadioGroupItem } from './radio-group.client'

function renderGroup(props: Record<string, unknown> = {}) {
  return render(
    <RadioGroup aria-label="Difficulty" {...props}>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="easy" value="easy" />
        <label htmlFor="easy">Easy</label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="deadly" value="deadly" />
        <label htmlFor="deadly">Deadly</label>
      </div>
    </RadioGroup>,
  )
}

describe('RadioGroup', () => {
  it('selects an option on click', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderGroup({ onValueChange })
    await user.click(screen.getByLabelText('Deadly'))
    expect(onValueChange).toHaveBeenCalledWith('deadly')
  })

  it('marks the selected option as checked', () => {
    renderGroup({ value: 'easy' })
    expect(screen.getByRole('radio', { name: 'Easy' })).toBeChecked()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderGroup()
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
