import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import {
  ORGANIZATION_MEMBER_PICKER_CREATE_NPC_UNAVAILABLE_MESSAGE,
  OrganizationMemberPickerDrawer,
} from './organization-member-picker-drawer.client'
import {
  ORGANIZATION_MEMBER_PICKER_AVAILABLE_CLASSES,
  ORGANIZATION_MEMBER_PICKER_CANDIDATES,
  ORGANIZATION_MEMBER_PICKER_ORGANIZATION,
} from './organization-member-picker-drawer.fixtures'

// Radix Select requires pointer-capture and scroll APIs missing from jsdom.
beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
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

  it('marks existing members with a status badge and no trailing control', () => {
    renderPicker()

    const titledMemberRow = screen
      .getByText('Circle Envoy')
      .closest('[data-entity-item-slot="content"]')?.parentElement
    expect(titledMemberRow).toBeTruthy()

    const titledStatusRow = titledMemberRow!.querySelector('[data-entity-summary-status-row]')
    expect(titledStatusRow).toBeTruthy()
    expect(
      within(titledStatusRow as HTMLElement).getByText('Member · Journeyman'),
    ).toBeInTheDocument()
    expect(titledMemberRow!.querySelector('[data-entity-item-slot="trailing"]')).toBeNull()

    const untitledMemberRow = screen
      .getByText('Silent Partner')
      .closest('[data-entity-item-slot="content"]')?.parentElement
    expect(untitledMemberRow).toBeTruthy()
    expect(
      within(
        untitledMemberRow!.querySelector('[data-entity-summary-status-row]') as HTMLElement,
      ).getByText('Member'),
    ).toBeInTheDocument()

    expect(screen.getAllByRole('button', { name: 'Add' })).toHaveLength(2)
  })

  it('lists addable candidates before existing members', () => {
    renderPicker()

    const streetRunner = screen.getByText('Street Runner')
    const verna = screen.getByText('Verna')
    const circleEnvoy = screen.getByText('Circle Envoy')
    const silentPartner = screen.getByText('Silent Partner')

    expect(
      streetRunner.compareDocumentPosition(circleEnvoy) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      verna.compareDocumentPosition(circleEnvoy) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      verna.compareDocumentPosition(silentPartner) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('shows a Recommended badge for affinity matches that are not already members', () => {
    renderPicker({
      memberClassRecommendations: {
        memberClassAffinityIds: ORGANIZATION_MEMBER_PICKER_ORGANIZATION.memberClassAffinityIds,
        playableClasses: ORGANIZATION_MEMBER_PICKER_AVAILABLE_CLASSES,
      },
    })

    const recommendedRow = screen
      .getByText('Street Runner')
      .closest('[data-entity-item-slot="content"]')?.parentElement
    expect(recommendedRow).toBeTruthy()
    expect(within(recommendedRow as HTMLElement).getByText('Recommended')).toBeInTheDocument()
    expect(screen.queryByText('Verna')?.closest('[data-entity-summary-status-row]')).toBeNull()
  })

  it('expands to configure a title, then stamps title and canonical priority on commit', async () => {
    const user = userEvent.setup()
    const { props } = renderPicker()

    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)
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

    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)
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

    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)
    await user.click(screen.getByRole('button', { name: 'Add member' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Membership failed')
    expect(props.onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it('renders the empty catalog state', () => {
    renderPicker({ candidates: [] })
    expect(screen.getByText('No characters are available.')).toBeInTheDocument()
  })

  it('shows Create new NPC in the empty catalog state when quick NPC creation is enabled', () => {
    renderPicker({
      candidates: [],
      quickNpc: { enabled: true, buildContextReady: true },
      onCreateNpc: vi.fn(),
    })

    expect(screen.getByRole('button', { name: 'Create new NPC' })).toBeInTheDocument()
    expect(screen.getByText('No characters are available.')).toBeInTheDocument()
  })

  it('renders Create new NPC between search and results outside the scroll body', () => {
    renderPicker({
      quickNpc: { enabled: true, buildContextReady: true },
      onCreateNpc: vi.fn(),
    })

    const search = screen.getByRole('textbox', { name: 'Search characters' })
    const action = screen.getByRole('button', { name: 'Create new NPC' })
    const result = screen.getByText('Verna')
    const scrollBody = result.closest('.overflow-y-auto')

    expect(search.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(action.compareDocumentPosition(result) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(scrollBody).toBeTruthy()
    expect(scrollBody).not.toContainElement(action)
  })

  it('does not render Create new NPC in the sheet footer', () => {
    renderPicker({
      quickNpc: { enabled: true, buildContextReady: true },
      onCreateNpc: vi.fn(),
    })

    const action = screen.getByRole('button', { name: 'Create new NPC' })
    const footer = action.closest('[class*="border-t"]')

    expect(footer).toBeNull()
  })

  it('hides the Create new NPC action when quick NPC creation is not wired', () => {
    renderPicker()
    expect(screen.queryByRole('button', { name: 'Create new NPC' })).not.toBeInTheDocument()
  })

  it('disables the Create new NPC action until the build context resolves', () => {
    renderPicker({
      quickNpc: { enabled: true, buildContextReady: false },
      onCreateNpc: vi.fn(),
    })

    expect(screen.getByRole('button', { name: 'Create new NPC' })).toBeDisabled()
  })

  it('delegates Create new NPC to the parent instead of swapping the drawer body', async () => {
    const user = userEvent.setup()
    const onCreateNpc = vi.fn()
    renderPicker({
      quickNpc: { enabled: true, buildContextReady: true },
      onCreateNpc,
    })

    await user.type(screen.getByRole('textbox', { name: 'Search characters' }), 'Envoy')
    await user.click(screen.getByRole('button', { name: 'Create new NPC' }))

    expect(onCreateNpc).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('heading', { name: 'Add member' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search characters' })).toHaveValue('Envoy')
    expect(screen.queryByRole('heading', { name: 'Create NPC' })).not.toBeInTheDocument()
  })

  it('replaces the Create new NPC action with a hint when the build context failed', () => {
    renderPicker({
      quickNpc: {
        enabled: true,
        buildContextFailed: true,
        buildContextReady: false,
      },
    })

    expect(screen.queryByRole('button', { name: 'Create new NPC' })).not.toBeInTheDocument()
    expect(
      screen.getByText(ORGANIZATION_MEMBER_PICKER_CREATE_NPC_UNAVAILABLE_MESSAGE),
    ).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderPicker()
    await expectNoAxeViolations(container)
  })
})
