import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { OrganizationMemberPickerDrawer } from './organization-member-picker-drawer.client'
import {
  ORGANIZATION_MEMBER_PICKER_CANDIDATES,
  ORGANIZATION_MEMBER_PICKER_ORGANIZATION,
} from './organization-member-picker-drawer.fixtures'

function renderPicker(
  overrides: Partial<React.ComponentProps<typeof OrganizationMemberPickerDrawer>> = {},
) {
  const props = {
    open: true,
    onOpenChange: vi.fn(),
    organization: ORGANIZATION_MEMBER_PICKER_ORGANIZATION,
    candidates: ORGANIZATION_MEMBER_PICKER_CANDIDATES,
    onAdd: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }

  return { props, ...render(<OrganizationMemberPickerDrawer {...props} />) }
}

describe('OrganizationMemberPickerDrawer', () => {
  it('lists merged PC and NPC candidates with identity metadata', () => {
    renderPicker()

    expect(screen.getByRole('heading', { name: 'Add member' })).toBeInTheDocument()
    expect(screen.getByText('Choose a character to add to Lantern Guild.')).toBeInTheDocument()
    expect(screen.getByText('PC · Dwarf · Level 1 Fighter')).toBeInTheDocument()
    expect(screen.getByText('NPC · Human · Level 3 Rogue')).toBeInTheDocument()
  })

  it('marks existing members and offers no add affordance for them', () => {
    renderPicker()

    expect(screen.getAllByText('Member').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Add' })).toHaveLength(1)
  })

  it('expands to configure a title, then stamps title and canonical priority on commit', async () => {
    const user = userEvent.setup()
    const { props } = renderPicker()

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(props.onAdd).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: 'No title' })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: 'Guildmaster' }))
    await user.click(screen.getByRole('button', { name: 'Add member' }))

    expect(props.onAdd).toHaveBeenCalledWith({
      characterId: 'char-1',
      characterType: 'pc',
      title: 'Guildmaster',
      priority: 50,
    })
    expect(props.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('omits title and priority when No title stays selected', async () => {
    const user = userEvent.setup()
    const { props } = renderPicker()

    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('button', { name: 'Add member' }))

    expect(props.onAdd).toHaveBeenCalledWith({ characterId: 'char-1', characterType: 'pc' })
  })

  it('filters candidates by search', async () => {
    const user = userEvent.setup()
    renderPicker()

    await user.type(screen.getByRole('textbox', { name: 'Search characters' }), 'Envoy')

    expect(screen.getByText('Circle Envoy')).toBeInTheDocument()
    expect(screen.queryByText('Verna')).not.toBeInTheDocument()
  })

  it('keeps the drawer open with an inline error when the commit fails', async () => {
    const user = userEvent.setup()
    const { props } = renderPicker({
      onAdd: vi.fn().mockRejectedValue(new Error('Membership failed')),
    })

    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('button', { name: 'Add member' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Membership failed')
    expect(props.onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it('renders the empty catalog state', () => {
    renderPicker({ candidates: [] })
    expect(screen.getByText('No characters are available.')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderPicker()
    await expectNoAxeViolations(container)
  })
})
