import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CampaignNpcDetail } from '@rpg/contracts'

import { makeCampaignNpcDetail } from '@/test/fixtures/factories/additional/character'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '@/features/character'
import { QUICK_NPC_CLASS_ALL_GROUP_EYEBROW } from '../lib/quick-npc-class-option-groups.lib'
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
  organizationDomain: 'occupational' as const,
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

const rogueClass = {
  ...populatedBuilderCatalog.classes[0]!,
  id: 'srd-cc-5.2.1:rogue',
  slug: 'rogue',
  name: 'Rogue',
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
        organizationDomain: organization.organizationDomain,
        functions: [],
        practices: [],
        members: { classAffinityIds: [], speciesAffinityIds: [], titles: [] },
        connections: { locations: [] },
      },
    ],
  },
})

const npcDetail = makeCampaignNpcDetail({
  character: { id: 'npc-99', name: 'Guard Captain' },
  participation: { id: 'participation-99' },
})

async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  fieldName: RegExp,
  optionName: RegExp,
) {
  await user.click(screen.getByRole('combobox', { name: fieldName }))
  await user.click(screen.getByRole('option', { name: optionName }))
}

async function completeSetup(user: ReturnType<typeof userEvent.setup>) {
  const dwarfRadio = screen.queryByRole('radio', { name: /dwarf/i })
  if (dwarfRadio) {
    await user.click(dwarfRadio)
  }

  let fighterRadio = screen.queryByRole('radio', { name: /fighter/i })
  if (!fighterRadio) {
    const levelInput = screen.getByRole('spinbutton', { name: 'Level' })
    await user.clear(levelInput)
    await user.type(levelInput, '1')
    fighterRadio = await screen.findByRole('radio', { name: /fighter/i })
  }

  if (fighterRadio?.getAttribute('aria-checked') !== 'true') {
    await user.click(screen.getByRole('radio', { name: /fighter/i }))
  }

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

  it('wraps setup content in a scroll region inside the stable modal body', () => {
    renderModal()

    const speciesPrompt = screen.getByText('What species is this NPC?')
    const scrollRegion = speciesPrompt.closest('.overflow-y-auto')

    expect(scrollRegion).toBeTruthy()
    expect(scrollRegion?.className).toContain('min-h-0')
    expect(scrollRegion?.className).toContain('pb-6')
  })

  it('wraps authoring content in a scroll region inside the stable modal body', async () => {
    const user = userEvent.setup()
    renderModal()

    await completeSetup(user)

    const changeSetup = screen.getByRole('button', { name: 'Change' })
    const scrollRegion = changeSetup.closest('.overflow-y-auto')

    expect(scrollRegion).toBeTruthy()
    expect(scrollRegion?.className).toContain('min-h-0')
    expect(scrollRegion?.className).toContain('pb-6')
    expect(scrollRegion).toContainElement(screen.getByRole('tablist'))
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

  it('groups class choices by organization member class affinities during setup', async () => {
    const user = userEvent.setup()
    renderModal({
      buildContext: createCampaignNpcBuilderContextFixture({
        catalog: {
          ...populatedBuilderCatalog,
          classes: [quickFighter, rogueClass],
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
              organizationDomain: organization.organizationDomain,
              functions: [],
              practices: [],
              members: { classAffinityIds: [rogueClass.id], speciesAffinityIds: [], titles: [] },
              connections: { locations: [] },
            },
          ],
        },
      }),
      organization: {
        ...organization,
        members: { classAffinityIds: [rogueClass.id], speciesAffinityIds: [], titles: [] },
      },
    })

    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    const levelInput = screen.getByRole('spinbutton', { name: 'Level' })
    await user.clear(levelInput)
    await user.type(levelInput, '1')

    expect(screen.getByText('Recommended for this organization')).toBeInTheDocument()
    expect(screen.getByText(QUICK_NPC_CLASS_ALL_GROUP_EYEBROW)).toBeInTheDocument()
  })
})
