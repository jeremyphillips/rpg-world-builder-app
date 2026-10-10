import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { UI_CHOICE_CONTROL_BLOCK_CLASS } from './choice-control.styles'
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
  it('emits semantic choice-control classes on items', () => {
    renderGroup()
    expect(screen.getByRole('radio', { name: 'Easy' })).toHaveClass(
      UI_CHOICE_CONTROL_BLOCK_CLASS,
      'ui-choice-control--radio',
    )
  })

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

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderGroup()
    await expectNoAxeViolations(container)
  })
})
