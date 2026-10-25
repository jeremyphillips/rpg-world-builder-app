import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { Chip } from './chip.client'

describe('Chip', () => {
  it('selectable unselected renders a button with aria-checked false', () => {
    render(
      <Chip mode="selectable" selected={false} onSelectedChange={vi.fn()}>
        Option
      </Chip>,
    )
    expect(screen.getByRole('checkbox', { name: 'Option' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    expect(screen.getByRole('checkbox', { name: 'Option' })).toHaveClass(
      'ui-chip',
      'ui-compact-label--interactive',
    )
  })

  it('selectable selected renders check icon and aria-checked true', () => {
    render(
      <Chip mode="selectable" selected onSelectedChange={vi.fn()}>
        Selected
      </Chip>,
    )
    const button = screen.getByRole('checkbox', { name: 'Selected' })
    expect(button).toHaveAttribute('aria-checked', 'true')
    expect(button).toHaveClass('ui-compact-label--selected')
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('calls onSelectedChange when toggled', async () => {
    const onSelectedChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Chip mode="selectable" selected={false} onSelectedChange={onSelectedChange}>
        Toggle
      </Chip>,
    )

    await user.click(screen.getByRole('checkbox', { name: 'Toggle' }))
    expect(onSelectedChange).toHaveBeenCalledWith(true)
  })

  it('removable sm uses compact chip scale with expanded remove hit target', () => {
    render(
      <Chip mode="removable" size="sm" removeLabel="Remove Tag" onRemove={vi.fn()}>
        Tag
      </Chip>,
    )
    const chip = screen.getByText('Tag').closest('.ui-compact-label')
    expect(chip).toHaveClass('ui-chip', 'ui-compact-label--sm', 'ui-compact-label--removable-sm')
    const remove = screen.getByRole('button', { name: 'Remove Tag' })
    expect(remove).toHaveClass('ui-compact-label__remove', 'ui-compact-control--icon-compact-sm')
    expect(remove).not.toHaveClass('ui-chip')
  })

  it('removable calls onRemove from dismiss button', async () => {
    const onRemove = vi.fn()
    const user = userEvent.setup()
    render(
      <Chip mode="removable" size="md" removeLabel="Remove Dagger" onRemove={onRemove}>
        Dagger
      </Chip>,
    )

    await user.click(screen.getByRole('button', { name: 'Remove Dagger' }))
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('has no accessibility violations for selectable chip', async () => {
    const { container } = render(
      <Chip mode="selectable" selected onSelectedChange={vi.fn()}>
        Value
      </Chip>,
    )
    await expectNoAxeViolations(container)
  })

  it('has no accessibility violations for removable chip', async () => {
    const { container } = render(
      <Chip mode="removable" size="md" removeLabel="Remove Dagger" onRemove={vi.fn()}>
        Dagger
      </Chip>,
    )
    await expectNoAxeViolations(container)
  })
})
