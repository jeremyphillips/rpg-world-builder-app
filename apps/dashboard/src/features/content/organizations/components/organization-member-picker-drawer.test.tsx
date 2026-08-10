import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '@/features/character'
import { renderWithProviders } from '@/test/render'

import { OrganizationMemberPickerDrawer } from './organization-member-picker-drawer.client'
import {
  ORGANIZATION_MEMBER_PICKER_CANDIDATES,
  ORGANIZATION_MEMBER_PICKER_ORGANIZATION,
} from './organization-member-picker-drawer.fixtures'

const quickNpcBuildContext = createCampaignNpcBuilderContextFixture({
  catalog: populatedBuilderCatalog,
})

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

  return { props, ...renderWithProviders(<OrganizationMemberPickerDrawer {...props} />) }
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

  it('hides the Create new NPC action when quick NPC creation is not wired', () => {
    renderPicker()
    expect(screen.queryByRole('button', { name: 'Create new NPC' })).not.toBeInTheDocument()
  })

  it('disables the Create new NPC action until the build context resolves', () => {
    renderPicker({
      quickNpc: { campaignId: 'campaign-test-1', buildContext: null, onCreated: vi.fn() },
    })

    expect(screen.getByRole('button', { name: 'Create new NPC' })).toBeDisabled()
  })

  it('switches to the Quick NPC view and preserves both views across Back', async () => {
    const user = userEvent.setup()
    renderPicker({
      quickNpc: {
        campaignId: 'campaign-test-1',
        buildContext: quickNpcBuildContext,
        onCreated: vi.fn(),
      },
    })

    await user.type(screen.getByRole('textbox', { name: 'Search characters' }), 'Envoy')
    await user.click(screen.getByRole('button', { name: 'Create new NPC' }))

    // Picker chrome swaps for the Quick NPC form within the same drawer.
    expect(screen.getByRole('heading', { name: 'Create NPC' })).toBeInTheDocument()
    expect(screen.getByText('Create a new NPC as a member of Lantern Guild.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Search characters' })).not.toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Half-entered NPC')
    await user.click(screen.getByRole('button', { name: 'Back' }))

    // Picker state (search) survived the round trip.
    expect(screen.getByRole('heading', { name: 'Add member' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search characters' })).toHaveValue('Envoy')

    // Quick NPC values survive re-entry within the same drawer session.
    await user.click(screen.getByRole('button', { name: 'Create new NPC' }))
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Half-entered NPC')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderPicker()
    await expectNoAxeViolations(container)
  })
})
