import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { OrganizationPickerDrawer } from './organization-picker-drawer.client'
import { organizationPickerItems } from './organization-picker-drawer.fixtures'

describe('OrganizationPickerDrawer', () => {
  it('searches by organization type and supports add/remove actions', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    const onRemove = vi.fn()

    render(
      <OrganizationPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={organizationPickerItems}
        selectedCount={1}
        onAdd={onAdd}
        onRemove={onRemove}
      />,
    )

    expect(screen.getByText('1 organization selected.')).toBeInTheDocument()
    expect(screen.getByText('Lantern Guild')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onRemove).toHaveBeenCalledWith('organization-lantern-guild')

    await user.type(screen.getByRole('textbox', { name: 'Search organizations' }), 'government')
    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(screen.queryByText('Silver Circle')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(onAdd).toHaveBeenCalledWith('organization-city-council')

    const search = screen.getByRole('textbox', { name: 'Search organizations' })
    await user.clear(search)
    await user.type(search, 'no matching organization')
    expect(screen.getByText('No organizations match this view.')).toBeInTheDocument()
  })

  it('resets search and type view and has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <OrganizationPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={organizationPickerItems}
        selectedCount={0}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Search organizations' }), 'circle')
    await user.click(screen.getByRole('button', { name: 'Reset view' }))

    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(screen.getByText('Silver Circle')).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })

  it('renders the empty catalog state', () => {
    render(
      <OrganizationPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[]}
        selectedCount={0}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByText('No organizations are available.')).toBeInTheDocument()
  })

  it('closes from the keyboard', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <OrganizationPickerDrawer
        open
        onOpenChange={onOpenChange}
        items={organizationPickerItems}
        selectedCount={0}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
