import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu.client'
import { Button } from './button.client'
import { InteractiveList } from './interactive-list.client'
import { MenuChoiceRow } from './menu-choice-row.client'

describe('MenuChoiceRow', () => {
  it('renders menuitem without option semantics', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button type="button">Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <MenuChoiceRow heading="Add parent" onSelect={() => {}} />
          <MenuChoiceRow
            heading="Add child"
            supporting="Nested under the current location"
            onSelect={() => {}}
          />
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    expect(screen.getByRole('menuitem', { name: /Add parent/i })).toBeInTheDocument()
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Add parent/i })).not.toHaveAttribute(
      'aria-selected',
    )
    expect(screen.getByRole('menuitem', { name: /Add parent/i }).className).toContain('px-3')
    expect(screen.getByRole('menuitem', { name: /Add parent/i }).className).toContain('py-2')

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')
  })

  it('moves data-highlighted with arrow keys and activates on Enter', async () => {
    const user = userEvent.setup()
    const onSecond = vi.fn()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <InteractiveList>
            <MenuChoiceRow heading="First" onSelect={() => {}} />
            <MenuChoiceRow heading="Second" supporting="Details" onSelect={onSecond} />
          </InteractiveList>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onSecond).toHaveBeenCalledTimes(1)
  })
})
