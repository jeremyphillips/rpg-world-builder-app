import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { OrganizationPickerDrawer } from './organization-picker-drawer'
import { organizationPickerItems } from './organization-picker-drawer.fixtures'

describe('OrganizationPickerDrawer', () => {
  it('expands on Add without committing, then submits title and closes', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <OrganizationPickerDrawer
        open
        onOpenChange={onOpenChange}
        items={organizationPickerItems.map((item) => ({ ...item, selected: false }))}
        onAdd={onAdd}
      />,
    )

    expect(
      screen.getByText('Choose an organization connected to this character.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Choose organization' })).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Search organizations' }), 'Lantern')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'No title' })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: 'Guildmaster' }))
    await user.click(screen.getByRole('button', { name: 'Add organization' }))

    expect(onAdd).toHaveBeenCalledWith({
      organizationId: 'organization-lantern-guild',
      title: 'Guildmaster',
      priority: 50,
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('omits title and priority when No title is selected', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    render(
      <OrganizationPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={organizationPickerItems.map((item) => ({ ...item, selected: false }))}
        onAdd={onAdd}
      />,
    )

    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)
    await user.click(screen.getByRole('button', { name: 'Add organization' }))

    expect(onAdd).toHaveBeenCalledWith({ organizationId: 'organization-city-council' })
  })

  it('shows already-added organizations as added and prevents duplicate add', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    render(
      <OrganizationPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={organizationPickerItems}
        onAdd={onAdd}
      />,
    )

    expect(screen.getByText('Added')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Search organizations' }), 'government')
    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(screen.queryByText('Silver Circle')).not.toBeInTheDocument()
  })

  it('resets search and type view and has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <OrganizationPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={organizationPickerItems}
        onAdd={vi.fn()}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Search organizations' }), 'circle')
    await user.click(screen.getByRole('button', { name: 'Reset view' }))

    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(screen.getByText('Silver Circle')).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })

  it('renders the empty catalog state', () => {
    render(<OrganizationPickerDrawer open onOpenChange={vi.fn()} items={[]} onAdd={vi.fn()} />)

    expect(screen.getByText('No organizations are available.')).toBeInTheDocument()
  })

  it('resets transactional membership config when the drawer closes', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    const { rerender } = render(
      <OrganizationPickerDrawer
        open
        onOpenChange={onOpenChange}
        items={organizationPickerItems.map((item) => ({ ...item, selected: false }))}
        onAdd={vi.fn()}
      />,
    )

    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)
    await user.click(screen.getByRole('radio', { name: 'Guildmaster' }))
    expect(screen.getByRole('radio', { name: 'Guildmaster' })).toBeChecked()

    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)

    rerender(
      <OrganizationPickerDrawer
        open={false}
        onOpenChange={onOpenChange}
        items={organizationPickerItems.map((item) => ({ ...item, selected: false }))}
        onAdd={vi.fn()}
      />,
    )

    rerender(
      <OrganizationPickerDrawer
        open
        onOpenChange={onOpenChange}
        items={organizationPickerItems.map((item) => ({ ...item, selected: false }))}
        onAdd={vi.fn()}
      />,
    )

    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)
    expect(screen.getByRole('radio', { name: 'No title' })).toBeChecked()
  })

  it('closes from the keyboard', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <OrganizationPickerDrawer
        open
        onOpenChange={onOpenChange}
        items={organizationPickerItems}
        onAdd={vi.fn()}
      />,
    )

    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('keeps the drawer open with an error when onAdd rejects', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onAdd = vi.fn().mockRejectedValue(new Error('Membership failed'))

    render(
      <OrganizationPickerDrawer
        open
        onOpenChange={onOpenChange}
        items={organizationPickerItems.map((item) => ({ ...item, selected: false }))}
        onAdd={onAdd}
      />,
    )

    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)
    await user.click(screen.getByRole('button', { name: 'Add organization' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Membership failed')
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    expect(screen.getByRole('radio', { name: 'No title' })).toBeChecked()
  })
})
