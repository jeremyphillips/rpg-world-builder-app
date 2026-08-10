import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import type { CampaignNpcDetail } from '@rpg/contracts'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '@/features/character'
import { renderWithProviders } from '@/test/render'

import {
  ORGANIZATION_MEMBER_PICKER_CREATE_NPC_UNAVAILABLE_MESSAGE,
  OrganizationMemberPickerDrawer,
} from './organization-member-picker-drawer.client'
import {
  ORGANIZATION_MEMBER_PICKER_CANDIDATES,
  ORGANIZATION_MEMBER_PICKER_ORGANIZATION,
} from './organization-member-picker-drawer.fixtures'

const createNpcMock = vi.hoisted(() => vi.fn())

vi.mock('@/features/character/npc/api/npc-client', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  createNpc: createNpcMock,
}))

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

const quickNpcBuildContext = createCampaignNpcBuilderContextFixture({
  catalog: populatedBuilderCatalog,
})

/** Fighter variant whose skill choice the automatic resolver can satisfy. */
const quickFighter = {
  ...populatedBuilderCatalog.classes[0]!,
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
      },
    },
  },
}

/** Build context whose Quick NPC submissions resolve and finalize successfully. */
const submittableBuildContext = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...populatedBuilderCatalog,
    classes: [quickFighter],
    organizations: [
      {
        id: ORGANIZATION_MEMBER_PICKER_ORGANIZATION.id,
        slug: 'lantern-guild',
        rulesetId: 'srd-cc-5.2.1',
        source: 'homebrew',
        status: 'published',
        campaignId: 'campaign-test-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: ORGANIZATION_MEMBER_PICKER_ORGANIZATION.name,
        organizationKind: ORGANIZATION_MEMBER_PICKER_ORGANIZATION.organizationKind,
        connections: { locations: [] },
      },
    ],
  },
})

const npcDetail = {
  character: { id: 'npc-99', name: 'Guard Captain' },
  participation: { id: 'participation-99' },
} as unknown as CampaignNpcDetail

async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  fieldName: RegExp,
  optionName: RegExp,
) {
  await user.click(screen.getByRole('combobox', { name: fieldName }))
  await user.click(screen.getByRole('option', { name: optionName }))
}

async function fillQuickNpcSeedFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: /name/i }), 'Guard Captain')
  await selectOption(user, /species/i, /dwarf/i)
  await selectOption(user, /class/i, /fighter/i)
  await selectOption(user, /alignment/i, /lawful neutral/i)
}

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
  beforeEach(() => {
    createNpcMock.mockReset()
  })

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

  it('replaces the Create new NPC action with a hint when the build context failed', () => {
    renderPicker({
      quickNpc: {
        campaignId: 'campaign-test-1',
        buildContext: null,
        buildContextFailed: true,
        onCreated: vi.fn(),
      },
    })

    expect(screen.queryByRole('button', { name: 'Create new NPC' })).not.toBeInTheDocument()
    expect(
      screen.getByText(ORGANIZATION_MEMBER_PICKER_CREATE_NPC_UNAVAILABLE_MESSAGE),
    ).toBeInTheDocument()
  })

  it('clears the Quick NPC session when the drawer is dismissed', async () => {
    const user = userEvent.setup()
    const { props } = renderPicker({
      quickNpc: {
        campaignId: 'campaign-test-1',
        buildContext: quickNpcBuildContext,
        onCreated: vi.fn(),
      },
    })

    await user.click(screen.getByRole('button', { name: 'Create new NPC' }))
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Draft NPC')
    await user.keyboard('{Escape}')

    expect(props.onOpenChange).toHaveBeenCalledWith(false)

    // The controlled harness keeps `open` true — the drawer already reset to the picker view.
    expect(screen.getByRole('heading', { name: 'Add member' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Create new NPC' }))
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('')
  })

  it('closes the drawer and clears the session after a successful Quick NPC creation', async () => {
    const user = userEvent.setup()
    createNpcMock.mockResolvedValue(npcDetail)
    const onCreated = vi.fn()
    const { props } = renderPicker({
      quickNpc: {
        campaignId: 'campaign-test-1',
        buildContext: submittableBuildContext,
        onCreated,
      },
    })

    await user.click(screen.getByRole('button', { name: 'Create new NPC' }))
    await fillQuickNpcSeedFields(user)
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(npcDetail))
    expect(props.onOpenChange).toHaveBeenCalledWith(false)

    // Session cleared — re-entering shows a fresh form.
    await user.click(screen.getByRole('button', { name: 'Create new NPC' }))
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('')
  })

  it('blocks dismissal while Quick NPC creation is in flight', async () => {
    const user = userEvent.setup()
    let resolveCreate: (npc: CampaignNpcDetail) => void = () => undefined
    createNpcMock.mockImplementation(
      () =>
        new Promise<CampaignNpcDetail>((resolve) => {
          resolveCreate = resolve
        }),
    )
    const { props } = renderPicker({
      quickNpc: {
        campaignId: 'campaign-test-1',
        buildContext: submittableBuildContext,
        onCreated: vi.fn(),
      },
    })

    await user.click(screen.getByRole('button', { name: 'Create new NPC' }))
    await fillQuickNpcSeedFields(user)
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))
    await waitFor(() => expect(createNpcMock).toHaveBeenCalled())

    await user.keyboard('{Escape}')
    expect(props.onOpenChange).not.toHaveBeenCalled()

    resolveCreate(npcDetail)
    await waitFor(() => expect(props.onOpenChange).toHaveBeenCalledWith(false))
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderPicker()
    await expectNoAxeViolations(container)
  })
})
