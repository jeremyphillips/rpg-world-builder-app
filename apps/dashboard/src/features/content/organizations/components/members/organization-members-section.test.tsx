import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../../lib/organization-display'
import { ORGANIZATION_MEMBERS_LOAD_ERROR } from '../../lib/members/organization-members.constants'
import { ORGANIZATION_MEMBER_ROWS } from './organization-members-section.fixtures'
import {
  OrganizationMembersSection,
  type OrganizationMembersSectionProps,
} from './organization-members-section.client'

function renderSection(props: Partial<OrganizationMembersSectionProps> = {}) {
  return render(
    <MemoryRouter>
      <OrganizationMembersSection
        rows={ORGANIZATION_MEMBER_ROWS}
        emptyText={ORGANIZATION_EMPTY_SECTION_TEXT.members}
        {...props}
      />
    </MemoryRouter>,
  )
}

describe('OrganizationMembersSection', () => {
  it('renders the roster with titles inline and PC/NPC identity lines', () => {
    renderSection()

    expect(screen.getByRole('heading', { name: 'Members' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Circle Envoy' })).toHaveAttribute(
      'href',
      '/campaigns/camp-1/npcs/npc-1',
    )
    expect(screen.getByText('Speaker')).toBeInTheDocument()
    expect(screen.getByText('NPC · Human · Level 3 Rogue')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Verna' })).toBeInTheDocument()
    expect(screen.getByText('PC · Dwarf · Level 1 Fighter')).toBeInTheDocument()
  })

  it('renders untitled memberships as the name alone', () => {
    renderSection({ rows: [ORGANIZATION_MEMBER_ROWS[1]!] })

    expect(screen.getByRole('link', { name: 'Verna' })).toBeInTheDocument()
    expect(screen.queryByText('Speaker')).not.toBeInTheDocument()
  })

  it('exposes edit and remove actions to managers', async () => {
    const user = userEvent.setup()
    const onEditMembership = vi.fn()
    const onRemoveMember = vi.fn()

    renderSection({ canManage: true, onEditMembership, onRemoveMember, onAddMember: vi.fn() })

    await user.click(screen.getByRole('button', { name: 'Actions for Circle Envoy' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit membership' }))
    expect(onEditMembership).toHaveBeenCalledWith(ORGANIZATION_MEMBER_ROWS[0])

    await user.click(screen.getByRole('button', { name: 'Actions for Circle Envoy' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Remove member' }))
    expect(onRemoveMember).toHaveBeenCalledWith(ORGANIZATION_MEMBER_ROWS[0])
  })

  it('renders the add action in the footer when the roster is populated', () => {
    renderSection({ canManage: true, onAddMember: vi.fn() })

    const addButton = screen.getByRole('button', { name: 'Add member' })
    expect(addButton).toBeInTheDocument()
    expect(addButton.closest('[data-slot="relationship-list-footer"]')).toBeInTheDocument()
  })

  it('renders the add action for managers only', () => {
    const onAddMember = vi.fn()
    const { unmount } = renderSection({ canManage: true, onAddMember })
    expect(screen.getByRole('button', { name: 'Add member' })).toBeInTheDocument()
    unmount()

    renderSection({ canManage: false, onAddMember })
    expect(screen.queryByRole('button', { name: 'Add member' })).not.toBeInTheDocument()
  })

  it('renders a read-only roster with no row actions for non-managers', () => {
    // Surface policy: even a PC owner who could edit their own membership on the
    // server still sees a read-only roster on the organization page when they are
    // not a campaign manager — they edit from their character sheet instead.
    renderSection({
      canManage: false,
      onEditMembership: vi.fn(),
      onRemoveMember: vi.fn(),
      onAddMember: vi.fn(),
    })

    expect(screen.getByRole('link', { name: 'Circle Envoy' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Actions for/ })).not.toBeInTheDocument()
  })

  it('renders the empty state', () => {
    renderSection({ rows: [] })
    expect(screen.getByText(ORGANIZATION_EMPTY_SECTION_TEXT.members)).toBeInTheDocument()
  })

  it('notes when the roster exceeds the fetched page instead of truncating silently', () => {
    const { unmount } = renderSection({ total: 120 })
    expect(screen.getByText('Showing 2 of 120 members.')).toBeInTheDocument()
    unmount()

    renderSection({ total: ORGANIZATION_MEMBER_ROWS.length })
    expect(screen.queryByText(/Showing \d+ of \d+ members\./)).not.toBeInTheDocument()
  })

  it('renders loading and error copy in place of the roster', () => {
    const { unmount } = renderSection({ isPending: true })
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Circle Envoy' })).not.toBeInTheDocument()
    unmount()

    renderSection({ isError: true })
    expect(screen.getByText(ORGANIZATION_MEMBERS_LOAD_ERROR)).toBeInTheDocument()
  })

  it('surfaces mutation errors above the roster', () => {
    renderSection({ canManage: true, mutationError: 'Nope.' })
    expect(screen.getByText('Nope.')).toBeInTheDocument()
  })

  it('disables row actions while that member is pending', async () => {
    const user = userEvent.setup()
    renderSection({
      canManage: true,
      pendingCharacterId: 'npc-1',
      onEditMembership: vi.fn(),
      onRemoveMember: vi.fn(),
    })

    await user.click(screen.getByRole('button', { name: 'Actions for Circle Envoy' }))
    expect(await screen.findByRole('menuitem', { name: 'Remove member' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderSection({ canManage: true, onAddMember: vi.fn() })
    await expectNoAxeViolations(container)
  })
})
