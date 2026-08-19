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
import { QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL } from '../lib/quick-npc-build-card.lib'
import { renderWithProviders } from '@/test/render'

import { QuickNpcCreateModal } from './quick-npc-create-modal.client'
import {
  quickNpcOrganizationMemberCreateContext,
  quickNpcTestOrganization,
} from '../lib/quick-npc-test-fixtures'

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

const organization = quickNpcTestOrganization
const memberCreateContext = quickNpcOrganizationMemberCreateContext(organization)

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

async function setBuildCardLevel(user: ReturnType<typeof userEvent.setup>, level: string) {
  const changeLevelButton = screen.queryByRole('button', {
    name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL,
  })
  if (changeLevelButton) {
    await user.click(changeLevelButton)
  }

  const levelInput = await screen.findByRole('spinbutton', { name: 'Level' })
  await user.clear(levelInput)
  await user.type(levelInput, level)
}

async function selectBuildCardClass(user: ReturnType<typeof userEvent.setup>, className: RegExp) {
  let classRadio = screen.queryByRole('radio', { name: className })
  if (!classRadio) {
    await user.click(screen.getByRole('button', { name: /change class/i }))
    classRadio = await screen.findByRole('radio', { name: className })
  }

  if (classRadio.getAttribute('aria-checked') !== 'true') {
    await user.click(classRadio)
  }
}

async function completeSetup(user: ReturnType<typeof userEvent.setup>) {
  const noTitleRadio = screen.queryByRole('radio', { name: /no title/i })
  if (noTitleRadio) {
    await user.click(noTitleRadio)
  }

  const dwarfRadio = screen.queryByRole('radio', { name: /dwarf/i })
  if (dwarfRadio) {
    await user.click(dwarfRadio)
  }

  await setBuildCardLevel(user, '1')
  await selectBuildCardClass(user, /fighter/i)

  await user.click(screen.getByRole('button', { name: 'Continue' }))
}

function renderModal(overrides: Partial<React.ComponentProps<typeof QuickNpcCreateModal>> = {}) {
  const props = {
    open: true,
    onOpenChange: vi.fn(),
    campaignId: 'campaign-test-1',
    buildContext,
    context: memberCreateContext,
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

  it('renders a partial selections summary after title is chosen and species is active', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('radio', { name: /no title/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.getByText('No title')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change title' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }),
    ).toBeInTheDocument()
  })

  it('hides the build card until title and species are both complete', async () => {
    const user = userEvent.setup()
    renderModal()

    expect(
      screen.queryByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /no title/i }))
    expect(
      screen.queryByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Selections')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change title' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /what species/i })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    expect(
      screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }),
    ).toBeInTheDocument()
  })

  it('hides the build card when title is reopened', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('radio', { name: /no title/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    expect(
      screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change title' }))
    expect(
      screen.queryByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('preserves manual class and level when title is reconfirmed without a value change', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('radio', { name: /no title/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    await screen.findByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL })
    await setBuildCardLevel(user, '3')
    await selectBuildCardClass(user, /fighter/i)

    await user.click(screen.getByRole('button', { name: 'Change title' }))
    await user.click(screen.getByRole('radio', { name: /no title/i }))

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }))
    expect(screen.getByRole('spinbutton', { name: 'Level' })).toHaveValue(3)
    expect(screen.getByText('Fighter')).toBeInTheDocument()
  })

  it('collapses species into selections after selection while build remains pending', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('radio', { name: /no title/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.getByText('No title')).toBeInTheDocument()
    expect(screen.getByText('Dwarf')).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: /what species/i })).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Details' })).not.toBeInTheDocument()
  })

  it('returns to authoring when a setup row is reconfirmed without changing the value', async () => {
    const user = userEvent.setup()
    renderModal()

    await completeSetup(user)
    await user.click(screen.getByRole('button', { name: 'Change role' }))
    await user.click(screen.getByRole('radio', { name: /no title/i }))

    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
  })

  it('re-enters setup from the Build row without reopening a radio question', async () => {
    const user = userEvent.setup()
    renderModal()

    await completeSetup(user)
    await user.click(screen.getByRole('button', { name: 'Change build' }))

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: /what species/i })).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('shows setup-phase headline and description', () => {
    renderModal()

    expect(screen.getByText("Choose this member's role in the organization.")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Choose the member's role and starting character options. Recommendations come from this organization and can be changed before creation.",
      ),
    ).toBeInTheDocument()
  })

  it('wraps setup content in a scroll region inside the stable modal body', () => {
    renderModal()

    const titlePrompt = screen.getByText("Choose this member's role in the organization.")
    const scrollRegion = titlePrompt.closest('.overflow-y-auto')

    expect(scrollRegion).toBeTruthy()
    expect(scrollRegion?.className).toContain('min-h-0')
    expect(scrollRegion?.className).toContain('pb-6')
  })

  it('wraps authoring content in a scroll region inside the stable modal body', async () => {
    const user = userEvent.setup()
    renderModal()

    await completeSetup(user)

    const changeBuild = screen.getByRole('button', { name: 'Change build' })
    const scrollRegion = changeBuild.closest('.overflow-y-auto')

    expect(scrollRegion).toBeTruthy()
    expect(scrollRegion?.className).toContain('min-h-0')
    expect(scrollRegion?.className).toContain('pb-6')
    expect(scrollRegion).toContainElement(screen.getByRole('tablist'))
  })

  it('walks setup then authoring and returns to add on cancel', async () => {
    const user = userEvent.setup()
    const { props } = renderModal()

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

    await waitFor(() =>
      expect(props.onCreated).toHaveBeenCalledWith({
        contentType: 'npcs',
        id: npcDetail.character.id,
      }),
    )
    expect(props.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('returns to setup from Build row Change and clears back to details on continue', async () => {
    const user = userEvent.setup()
    renderModal()

    await completeSetup(user)
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Draft NPC')
    await user.click(screen.getByRole('button', { name: 'Change build' }))

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
    await waitFor(() =>
      expect(props.onCreated).toHaveBeenCalledWith({
        contentType: 'npcs',
        id: npcDetail.character.id,
      }),
    )
  })

  it('auto-seeds and collapses Class when exactly one recommendation exists', async () => {
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
      context: {
        kind: 'organization-member',
        organization: {
          ...organization,
          members: { classAffinityIds: [rogueClass.id], speciesAffinityIds: [], titles: [] },
        },
      },
    })

    await user.click(screen.getByRole('radio', { name: /no title/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    await setBuildCardLevel(user, '1')

    expect(screen.getByText('Rogue')).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /rogue/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('keeps Class expanded when multiple recommendations exist', async () => {
    const user = userEvent.setup()
    const wizardClass = {
      ...populatedBuilderCatalog.classes[0]!,
      id: 'srd-cc-5.2.1:wizard',
      slug: 'wizard',
      name: 'Wizard',
    }
    renderModal({
      buildContext: createCampaignNpcBuilderContextFixture({
        catalog: {
          ...populatedBuilderCatalog,
          classes: [quickFighter, rogueClass, wizardClass],
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
              members: {
                classAffinityIds: [rogueClass.id, quickFighter.id],
                speciesAffinityIds: [],
                titles: [],
              },
              connections: { locations: [] },
            },
          ],
        },
      }),
      context: {
        kind: 'organization-member',
        organization: {
          ...organization,
          members: {
            classAffinityIds: [rogueClass.id, quickFighter.id],
            speciesAffinityIds: [],
            titles: [],
          },
        },
      },
    })

    await user.click(screen.getByRole('radio', { name: /no title/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    await setBuildCardLevel(user, '1')

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: /rogue/i })).toBeInTheDocument()
    })
    expect(screen.getByText(QUICK_NPC_CLASS_ALL_GROUP_EYEBROW)).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /rogue/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('clears and recomputes Class when Species changes after a manual selection', async () => {
    const user = userEvent.setup()
    const elfSpecies = {
      ...populatedBuilderCatalog.species[0]!,
      id: 'srd-cc-5.2.1:elf',
      slug: 'elf',
      name: 'Elf',
    }
    renderModal({
      buildContext: createCampaignNpcBuilderContextFixture({
        catalog: {
          ...populatedBuilderCatalog,
          species: [populatedBuilderCatalog.species[0]!, elfSpecies],
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
              members: {
                classAffinityIds: [rogueClass.id, quickFighter.id],
                speciesAffinityIds: [],
                titles: [],
              },
              connections: { locations: [] },
            },
          ],
        },
      }),
      context: {
        kind: 'organization-member',
        organization: {
          ...organization,
          members: {
            classAffinityIds: [rogueClass.id, quickFighter.id],
            speciesAffinityIds: [],
            titles: [],
          },
        },
      },
    })

    await user.click(screen.getByRole('radio', { name: /no title/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    await setBuildCardLevel(user, '1')
    await selectBuildCardClass(user, /rogue/i)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()

    const changeSpecies = screen.queryByRole('button', { name: 'Change species' })
    if (changeSpecies) {
      await user.click(changeSpecies)
    }
    await user.click(screen.getByRole('radio', { name: /elf/i }))

    expect(screen.getByRole('radio', { name: /rogue/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /fighter/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })
})
