import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { SplitButton } from './split-button.client'

describe('SplitButton', () => {
  it('invokes the primary action from the main button', async () => {
    const user = userEvent.setup()
    const onPrimaryClick = vi.fn()

    render(<SplitButton label="Add person" onPrimaryClick={onPrimaryClick} />)

    await user.click(screen.getByRole('button', { name: 'Add person' }))
    expect(onPrimaryClick).toHaveBeenCalledTimes(1)
  })

  it('opens shortcut menu items from the chevron segment', async () => {
    const user = userEvent.setup()
    const onShortcut = vi.fn()

    render(
      <SplitButton
        label="Add person"
        onPrimaryClick={vi.fn()}
        menuGroups={[
          {
            id: 'family',
            label: 'Family',
            items: [{ id: 'parent', label: 'Add parent', onSelect: onShortcut }],
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add person shortcuts' }))
    await user.click(screen.getByRole('menuitem', { name: 'Add parent' }))
    expect(onShortcut).toHaveBeenCalledTimes(1)
  })

  it('omits the chevron when no menu groups are provided', () => {
    render(<SplitButton label="Add organization" onPrimaryClick={vi.fn()} menuGroups={[]} />)

    expect(screen.getByRole('button', { name: 'Add organization' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Add organization shortcuts' }),
    ).not.toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <SplitButton
        label="Add person"
        onPrimaryClick={vi.fn()}
        menuGroups={[
          {
            id: 'social',
            items: [{ id: 'friend', label: 'Add friend', onSelect: vi.fn() }],
          },
        ]}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
