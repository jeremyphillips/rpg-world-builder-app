import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CampaignNpcDetail } from '@rpg/contracts'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '@/features/character'
import { renderWithProviders } from '@/test/render'

import { QuickNpcCreateModal } from './quick-npc-create-modal.client'

const createNpcMock = vi.hoisted(() => vi.fn())

vi.mock('../api/npc-client', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  createNpc: createNpcMock,
}))

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

const organization = {
  id: 'organization-lantern-guild',
  name: 'Lantern Guild',
  organizationKind: 'professional' as const,
}

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

const buildContext = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...populatedBuilderCatalog,
    classes: [quickFighter],
    organizations: [
      {
        id: organization.id,
        slug: 'lantern-guild',
        rulesetId: 'srd-cc-5.2.1',
        source: 'homebrew',
        status: 'published',
        campaignId: 'campaign-test-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: organization.name,
        organizationKind: organization.organizationKind,
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

async function completeSetup(user: ReturnType<typeof userEvent.setup>) {
  await selectOption(user, /species/i, /dwarf/i)
  await selectOption(user, /class/i, /fighter/i)
  await user.click(screen.getByRole('button', { name: 'Continue' }))
}

function renderModal(overrides: Partial<React.ComponentProps<typeof QuickNpcCreateModal>> = {}) {
  const props = {
    open: true,
    onOpenChange: vi.fn(),
    campaignId: 'campaign-test-1',
    buildContext,
    organization,
    onCancel: vi.fn(),
    onCreated: vi.fn(),
    ...overrides,
  }

  return { props, ...renderWithProviders(<QuickNpcCreateModal {...props} />) }
}

describe('QuickNpcCreateModal', () => {
  beforeEach(() => {
    createNpcMock.mockReset()
    createNpcMock.mockResolvedValue(npcDetail)
  })

  it('walks setup then authoring and returns to add on cancel', async () => {
    const user = userEvent.setup()
    const { props } = renderModal()

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await completeSetup(user)
    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(props.onCancel).toHaveBeenCalledTimes(1)
  })

  it('creates an NPC from authoring and closes on success', async () => {
    const user = userEvent.setup()
    const { props } = renderModal()

    await completeSetup(user)
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Guard Captain')
    await selectOption(user, /alignment/i, /lawful neutral/i)
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))

    await waitFor(() => expect(props.onCreated).toHaveBeenCalledWith(npcDetail))
    expect(props.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('returns to setup from Change and clears back to details on continue', async () => {
    const user = userEvent.setup()
    renderModal()

    await completeSetup(user)
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Draft NPC')
    await user.click(screen.getByRole('button', { name: 'Change' }))

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    await completeSetup(user)
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('')
  })

  it('blocks cancel while creation is pending', async () => {
    const user = userEvent.setup()
    let resolveCreate: ((value: CampaignNpcDetail) => void) | undefined
    createNpcMock.mockImplementation(
      () =>
        new Promise<CampaignNpcDetail>((resolve) => {
          resolveCreate = resolve
        }),
    )

    const { props } = renderModal()
    await completeSetup(user)
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Guard Captain')
    await selectOption(user, /alignment/i, /lawful neutral/i)
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(props.onCancel).not.toHaveBeenCalled()

    resolveCreate?.(npcDetail)
    await waitFor(() => expect(props.onCreated).toHaveBeenCalledWith(npcDetail))
  })
})
