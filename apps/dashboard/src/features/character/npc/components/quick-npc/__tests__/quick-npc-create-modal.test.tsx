import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CampaignNpcDetail } from '@rpg/contracts'
import { TABBED_FORM_SECTIONS_ARIA_LABEL } from '@rpg/ui/form'

import { makeCampaignNpcDetail } from '@/test/fixtures/factories/additional/character'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '@/features/character'
import { QUICK_NPC_CLASS_ALL_GROUP_EYEBROW } from '../../../lib/quick-npc/quick-npc-class-option-groups.lib'
import { renderWithProviders } from '@/test/render'

import { QuickNpcCreateModal } from '../quick-npc-create-modal'
import {
  quickNpcOrganizationMemberCreateContext,
  quickNpcStandaloneCreateContext,
  quickNpcTestOrganization,
} from '../../../lib/quick-npc/quick-npc-test-fixtures'
import {
  QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE,
  QUICK_NPC_STANDALONE_SETUP_DESCRIPTION,
  QUICK_NPC_STANDALONE_SETUP_HEADLINE,
} from '../../../lib/quick-npc/quick-npc-create-modal-setup.lib'
import { QUICK_NPC_NPC_TEMPLATE_FIELD_PROMPT } from '../../../lib/quick-npc/quick-npc-npc-template-option.lib'
import { QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL } from '../../../lib/quick-npc/quick-npc-build-card.lib'
import { QUICK_NPC_PREVIEW_NPC_LABEL } from '../../../lib/quick-npc/quick-npc-preview-copy'
import { pickEquipment } from '@/test/fixtures/pick'

const createNpcMock = vi.hoisted(() => vi.fn())
const resolveQuickNpcAuthoringCreateInputMock = vi.hoisted(() => vi.fn())

vi.mock('../../../lib/quick-npc/quick-npc-narrative-on-create.lib', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    resolveQuickNpcAuthoringCreateInput: resolveQuickNpcAuthoringCreateInputMock,
  }
})

vi.mock('../../../api/npc-client', async (importOriginal) => ({
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
        members: {
          classAffinityIds: [],
          speciesAffinityIds: [],
          titles: [...organization.members.titles],
        },
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

async function fillAuthoringDetails(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('radio', { name: 'Male' }))
  await user.type(screen.getByRole('textbox', { name: /name/i }), name)
  await selectOption(user, /alignment/i, /lawful neutral/i)
}

async function setBuildCardLevel(user: ReturnType<typeof userEvent.setup>, level: string) {
  const levelInput = await screen.findByRole('spinbutton', { name: 'Level' })
  await user.clear(levelInput)
  await user.type(levelInput, level)
}

function buttonNamed(name: string, text: string) {
  return screen.getAllByRole('button', { name }).find((button) => button.textContent === text)
}

async function selectBuildCardRole(
  user: ReturnType<typeof userEvent.setup>,
  roleName: RegExp = /^guard$/i,
) {
  let roleRadio = screen.queryByRole('radio', { name: roleName })
  if (!roleRadio) {
    const changeRole = buttonNamed('Change role', 'Change role')
    if (changeRole) {
      await user.click(changeRole)
    }
    roleRadio = await screen.findByRole('radio', { name: roleName })
  }

  if (roleRadio.getAttribute('aria-checked') !== 'true') {
    await user.click(roleRadio)
  }
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
  const titleRadio = screen.queryByRole('radio', { name: /guildmaster/i })
  if (titleRadio) {
    await user.click(titleRadio)
  }

  const dwarfRadio = screen.queryByRole('radio', { name: /dwarf/i })
  if (dwarfRadio) {
    await user.click(dwarfRadio)
  }

  await selectBuildCardRole(user, /^criminal$/i)
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

beforeEach(async () => {
  createNpcMock.mockReset()
  createNpcMock.mockResolvedValue(npcDetail)
  resolveQuickNpcAuthoringCreateInputMock.mockReset()
  resolveQuickNpcAuthoringCreateInputMock.mockImplementation(
    async ({ prepared }: { prepared: { input: unknown } }) => prepared.input,
  )
})

describe('QuickNpcCreateModal', () => {
  it('renders a partial selections summary after title is chosen and species is active', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('radio', { name: /guildmaster/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.getByText('Guildmaster')).toBeInTheDocument()
    expect(buttonNamed('Change role', 'Change')).toBeTruthy()
    expect(screen.getByRole('spinbutton', { name: 'Level' })).toBeInTheDocument()
  })

  it('hides setup Preview NPC until the build step is open', async () => {
    const user = userEvent.setup()
    renderModal()

    expect(
      screen.queryByRole('button', { name: QUICK_NPC_PREVIEW_NPC_LABEL }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /guildmaster/i }))
    expect(
      screen.queryByRole('button', { name: QUICK_NPC_PREVIEW_NPC_LABEL }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    expect(screen.getByRole('button', { name: QUICK_NPC_PREVIEW_NPC_LABEL })).toBeInTheDocument()
  })

  it('hides setup Preview NPC when an earlier setup step is reopened', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('radio', { name: /guildmaster/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    expect(screen.getByRole('button', { name: QUICK_NPC_PREVIEW_NPC_LABEL })).toBeInTheDocument()

    await user.click(buttonNamed('Change role', 'Change')!)
    expect(
      screen.queryByRole('button', { name: QUICK_NPC_PREVIEW_NPC_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('keeps Preview NPC in authoring after setup completes', async () => {
    const user = userEvent.setup()
    renderModal()

    await completeSetup(user)

    expect(screen.getByRole('button', { name: QUICK_NPC_PREVIEW_NPC_LABEL })).toBeInTheDocument()
  })

  it('hides the build card until title and species are both complete', async () => {
    const user = userEvent.setup()
    renderModal()

    expect(screen.queryByRole('spinbutton', { name: 'Level' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /guildmaster/i }))
    expect(screen.queryByRole('spinbutton', { name: 'Level' })).not.toBeInTheDocument()
    expect(screen.queryByText('Selections')).toBeInTheDocument()
    expect(buttonNamed('Change role', 'Change')).toBeTruthy()
    expect(screen.getByRole('radiogroup', { name: /what species/i })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    expect(screen.getByRole('spinbutton', { name: 'Level' })).toBeInTheDocument()
  })

  it('hides the build card when title is reopened', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('radio', { name: /guildmaster/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    expect(screen.getByRole('spinbutton', { name: 'Level' })).toBeInTheDocument()

    await user.click(buttonNamed('Change role', 'Change')!)
    expect(screen.queryByRole('spinbutton', { name: 'Level' })).not.toBeInTheDocument()
  })

  it('preserves manual class and level when title is reconfirmed without a value change', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('radio', { name: /guildmaster/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    await screen.findByRole('spinbutton', { name: 'Level' })
    await setBuildCardLevel(user, '3')
    await selectBuildCardClass(user, /fighter/i)

    await user.click(buttonNamed('Change role', 'Change')!)
    await user.click(screen.getByRole('radio', { name: /guildmaster/i }))

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Level' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Level' })).toHaveValue(3)
    expect(screen.getByText('Fighter')).toBeInTheDocument()
  })

  it('collapses species into selections after selection while build remains pending', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('radio', { name: /guildmaster/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.getByText('Guildmaster')).toBeInTheDocument()
    expect(screen.getByText('Dwarf')).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: /what species/i })).not.toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Level' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Details' })).not.toBeInTheDocument()
  })

  it('returns to authoring when a setup row is reconfirmed without changing the value', async () => {
    const user = userEvent.setup()
    renderModal()

    await completeSetup(user)
    await user.click(screen.getByRole('button', { name: 'Change role' }))
    await user.click(screen.getByRole('radio', { name: /guildmaster/i }))

    expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
  })

  it('re-enters setup from the Build row without reopening a radio question', async () => {
    const user = userEvent.setup()
    renderModal()

    await completeSetup(user)
    await user.click(screen.getByRole('button', { name: 'Change build' }))

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: /what species/i })).not.toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Level' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('shows setup-phase headline and description', () => {
    renderModal()

    expect(screen.getByText(QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE)).toBeInTheDocument()
    expect(screen.getByText("Choose this member's role in the organization.")).toBeInTheDocument()
    expect(
      screen.getByText(
        'Choose a role and starting build from this organization’s recommendations.',
      ),
    ).toBeInTheDocument()
  })

  it('keeps organization-member headline in authoring and updates description', async () => {
    const user = userEvent.setup()
    renderModal()

    await completeSetup(user)

    expect(screen.getByText(QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE)).toBeInTheDocument()
    expect(
      screen.getByText(`Create a new NPC as a member of ${organization.name}.`),
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
    expect(scrollRegion).toContainElement(
      screen.getByRole('group', { name: TABBED_FORM_SECTIONS_ARIA_LABEL }),
    )
  })

  it('walks setup then authoring and returns to add on cancel', async () => {
    const user = userEvent.setup()
    const { props } = renderModal()

    await completeSetup(user)
    expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(props.onCancel).toHaveBeenCalledTimes(1)
  })

  it('creates an NPC from authoring and closes on success', async () => {
    const user = userEvent.setup()
    const { props } = renderModal()

    await completeSetup(user)
    await fillAuthoringDetails(user, 'Guard Captain')
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))

    await waitFor(() =>
      expect(props.onCreated).toHaveBeenCalledWith({
        contentType: 'npcs',
        id: npcDetail.character.id,
      }),
    )
    expect(props.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('returns to setup from Build row Change and keeps authoring values on continue', async () => {
    const user = userEvent.setup()
    renderModal()

    await completeSetup(user)
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Draft NPC')
    await user.click(screen.getByRole('button', { name: 'Change build' }))

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    await completeSetup(user)
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Draft NPC')
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
    await fillAuthoringDetails(user, 'Guard Captain')
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
              members: {
                classAffinityIds: [rogueClass.id],
                speciesAffinityIds: [],
                titles: [{ id: 'omt_member', label: 'Member', priority: 10 as const }],
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
            classAffinityIds: [rogueClass.id],
            speciesAffinityIds: [],
            titles: [{ id: 'omt_member', label: 'Member', priority: 10 as const }],
          },
        },
      },
    })

    await user.click(screen.getByRole('radio', { name: /^member$/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    await selectBuildCardRole(user)
    await setBuildCardLevel(user, '1')
    await selectBuildCardClass(user, /rogue/i)

    expect(screen.getByText('Rogue')).toBeInTheDocument()
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
                titles: [{ id: 'omt_member', label: 'Member', priority: 10 as const }],
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
            titles: [{ id: 'omt_member', label: 'Member', priority: 10 as const }],
          },
        },
      },
    })

    await user.click(screen.getByRole('radio', { name: /^member$/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    await selectBuildCardRole(user)
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
                titles: [{ id: 'omt_member', label: 'Member', priority: 10 as const }],
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
            titles: [{ id: 'omt_member', label: 'Member', priority: 10 as const }],
          },
        },
      },
    })

    await user.click(screen.getByRole('radio', { name: /^member$/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    await selectBuildCardRole(user)
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

describe('QuickNpcCreateModal standalone context', () => {
  const standaloneContext = quickNpcStandaloneCreateContext()

  const standaloneBuildContext = createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [quickFighter],
    },
  })

  const standaloneBuildContextMinLevelOne = createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [quickFighter],
    },
    characterCreationRules: {
      ...createCampaignNpcBuilderContextFixture().characterCreationRules,
      levelZeroNpcs: {
        ...createCampaignNpcBuilderContextFixture().characterCreationRules.levelZeroNpcs,
        enabled: false,
      },
    },
  })

  function renderStandaloneModal(
    overrides: Partial<React.ComponentProps<typeof QuickNpcCreateModal>> = {},
  ) {
    return renderModal({
      context: standaloneContext,
      buildContext: standaloneBuildContext,
      ...overrides,
    })
  }

  async function selectStandaloneRole(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
    await user.click(screen.getByRole('radio', { name }))
  }

  async function completeStandaloneSetup(user: ReturnType<typeof userEvent.setup>) {
    await selectStandaloneRole(user, /guard/i)
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    await setBuildCardLevel(user, '1')
    await selectBuildCardClass(user, /fighter/i)
    await user.click(screen.getByRole('button', { name: 'Continue' }))
  }

  it('keeps standalone headline in authoring and updates description', async () => {
    const user = userEvent.setup()
    renderStandaloneModal()

    await completeStandaloneSetup(user)

    expect(screen.getByText(QUICK_NPC_STANDALONE_SETUP_HEADLINE)).toBeInTheDocument()
    expect(screen.getByText('Create a new NPC.')).toBeInTheDocument()
  })

  it('shows role first without title or member copy', () => {
    renderStandaloneModal()

    expect(screen.getByText(QUICK_NPC_STANDALONE_SETUP_HEADLINE)).toBeInTheDocument()
    expect(screen.getByText(QUICK_NPC_STANDALONE_SETUP_DESCRIPTION)).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /guildmaster/i })).not.toBeInTheDocument()
    expect(screen.getByText(QUICK_NPC_NPC_TEMPLATE_FIELD_PROMPT)).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: /what species/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('shows build after role and species without title gating', async () => {
    const user = userEvent.setup()
    renderStandaloneModal()

    await selectStandaloneRole(user, /guard/i)
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    expect(screen.getByRole('spinbutton', { name: 'Level' })).toBeInTheDocument()
  })

  it('confirms Level 0 build without class', async () => {
    const user = userEvent.setup()
    renderStandaloneModal()

    await selectStandaloneRole(user, /commoner/i)
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    expect(screen.getByText(QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument()
  })

  it('blocks build until class is selected when campaign min is above 0', async () => {
    const user = userEvent.setup()
    renderStandaloneModal({ buildContext: standaloneBuildContextMinLevelOne })

    await selectStandaloneRole(user, /commoner/i)
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await selectBuildCardClass(user, /fighter/i)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('keeps manually added equipment after the class changes', async () => {
    const user = userEvent.setup()
    const spear = pickEquipment('spear')
    const rogue = {
      ...quickFighter,
      id: 'srd-cc-5.2.1:rogue',
      slug: 'rogue',
      name: 'Rogue',
    }
    renderStandaloneModal({
      buildContext: createCampaignNpcBuilderContextFixture({
        catalog: {
          ...populatedBuilderCatalog,
          classes: [quickFighter, rogue],
          equipment: [spear],
        },
      }),
    })

    await completeStandaloneSetup(user)
    await user.click(screen.getByRole('button', { name: 'Starting choices' }))
    await user.click(screen.getByRole('button', { name: /expand equipment/i }))
    await user.click(screen.getByRole('combobox', { name: 'Add equipment' }))
    await user.click(screen.getByRole('option', { name: /spear/i }))
    expect(screen.getByRole('button', { name: 'Remove Spear' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change build' }))
    await selectBuildCardClass(user, /rogue/i)

    const continueButton = screen.queryByRole('button', { name: 'Continue' })
    if (continueButton) {
      await user.click(continueButton)
    }

    await user.click(screen.getByRole('button', { name: 'Starting choices' }))
    const equipmentSection = screen.queryByRole('button', { name: /expand equipment/i })
    if (equipmentSection) {
      await user.click(equipmentSection)
    }
    expect(screen.getByRole('button', { name: 'Remove Spear' })).toBeInTheDocument()
  })

  it('keeps authoring details after changing species and continuing setup again', async () => {
    const user = userEvent.setup()
    const elfSpecies = {
      ...populatedBuilderCatalog.species[0]!,
      id: 'srd-cc-5.2.1:elf',
      slug: 'elf',
      name: 'Elf',
    }
    renderStandaloneModal({
      buildContext: createCampaignNpcBuilderContextFixture({
        catalog: {
          ...populatedBuilderCatalog,
          classes: [quickFighter],
          species: [populatedBuilderCatalog.species[0]!, elfSpecies],
        },
      }),
    })

    await completeStandaloneSetup(user)
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Town Scout')

    await user.click(screen.getByRole('button', { name: 'Change species' }))
    await user.click(screen.getByRole('radio', { name: /elf/i }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Town Scout')
    expect(screen.getByText('Elf')).toBeInTheDocument()
  })

  it('returns to authoring without changing setup when a setup edit is dismissed', async () => {
    const user = userEvent.setup()
    renderStandaloneModal()

    await completeStandaloneSetup(user)
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Town Scout')

    await user.click(screen.getByRole('button', { name: 'Change species' }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))

    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Town Scout')
    expect(screen.getByText('Dwarf')).toBeInTheDocument()
  })

  it('creates without membership and calls onCreated', async () => {
    const user = userEvent.setup()
    const { props } = renderStandaloneModal({ buildContext: standaloneBuildContextMinLevelOne })

    await completeStandaloneSetup(user)
    await fillAuthoringDetails(user, 'Town Guard')
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))

    await waitFor(() => expect(createNpcMock).toHaveBeenCalled())
    const createInput = createNpcMock.mock.calls[0]?.[1]
    expect(createInput?.relationshipEdges ?? []).toEqual([])
    await waitFor(() =>
      expect(props.onCreated).toHaveBeenCalledWith({
        contentType: 'npcs',
        id: npcDetail.character.id,
      }),
    )
  })

  it('does not call onCreated when cancelled from authoring', async () => {
    const user = userEvent.setup()
    const { props } = renderStandaloneModal({ buildContext: standaloneBuildContextMinLevelOne })

    await completeStandaloneSetup(user)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(props.onCreated).not.toHaveBeenCalled()
    expect(props.onCancel).toHaveBeenCalledTimes(1)
  })
})
