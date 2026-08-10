import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import type { CampaignNpcDetail, CharacterBuildContext } from '@rpg/contracts'

import { renderWithProviders } from '@/test/render'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import { createNpc } from '../api/npc-client'
import type * as NpcClient from '../api/npc-client'
import { QuickNpcCreateForm } from './quick-npc-create-form.client'

vi.mock('../api/npc-client', async (importOriginal) => ({
  ...(await importOriginal<typeof NpcClient>()),
  createNpc: vi.fn(),
}))

const createNpcMock = vi.mocked(createNpc)

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

const CAMPAIGN_ID = 'campaign-test-1'

const organization = {
  id: 'organization-1',
  name: 'Lantern Guild',
  organizationKind: 'professional' as const,
}

const organizationCatalogRow = {
  id: organization.id,
  slug: 'lantern-guild',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'homebrew' as const,
  status: 'published' as const,
  campaignId: CAMPAIGN_ID,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: organization.name,
  organizationKind: organization.organizationKind,
  connections: { locations: [] },
}

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

function buildContextFixture(
  overrides: { classes?: (typeof quickFighter)[] } = {},
): CharacterBuildContext {
  return createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: overrides.classes ?? [quickFighter],
      organizations: [organizationCatalogRow],
    },
  })
}

const npcDetail = {
  character: { id: 'npc-99', name: 'Guard Captain' },
  participation: { id: 'participation-99' },
} as unknown as CampaignNpcDetail

function renderForm(overrides: Partial<React.ComponentProps<typeof QuickNpcCreateForm>> = {}) {
  const props = {
    campaignId: CAMPAIGN_ID,
    buildContext: buildContextFixture(),
    organization,
    onBack: vi.fn(),
    onCreated: vi.fn(),
    ...overrides,
  }

  return { props, ...renderWithProviders(<QuickNpcCreateForm {...props} />) }
}

async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  fieldName: RegExp,
  optionName: RegExp,
) {
  await user.click(screen.getByRole('combobox', { name: fieldName }))
  await user.click(screen.getByRole('option', { name: optionName }))
}

async function fillSeedFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: /name/i }), 'Guard Captain')
  await selectOption(user, /species/i, /dwarf/i)
  await selectOption(user, /class/i, /fighter/i)
  await selectOption(user, /alignment/i, /lawful neutral/i)
}

describe('QuickNpcCreateForm', () => {
  beforeEach(() => {
    createNpcMock.mockReset()
    createNpcMock.mockResolvedValue(npcDetail)
  })

  it('renders seed fields and the canonical membership title options', () => {
    renderForm()

    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /species/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /class/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /level/i })).toHaveValue(1)
    expect(screen.getByRole('combobox', { name: /alignment/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'No title' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Guildmaster' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create NPC' })).toBeInTheDocument()
  })

  it('creates the NPC atomically with the titled membership connection', async () => {
    const user = userEvent.setup()
    const { props } = renderForm()

    await fillSeedFields(user)
    await user.click(screen.getByRole('radio', { name: 'Guildmaster' }))
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))

    await waitFor(() => expect(props.onCreated).toHaveBeenCalledWith(npcDetail))

    expect(createNpcMock).toHaveBeenCalledTimes(1)
    const [campaignId, input] = createNpcMock.mock.calls[0]!
    expect(campaignId).toBe(CAMPAIGN_ID)
    expect(input).toMatchObject({
      name: 'Guard Captain',
      alignment: 'ln',
      classes: [{ classId: quickFighter.id, level: 1 }],
    })
    expect(input.connections.organizations).toEqual([
      { organizationId: organization.id, title: 'Guildmaster', priority: 50 },
    ])
  })

  it('omits title and priority when No title stays selected', async () => {
    const user = userEvent.setup()
    const { props } = renderForm()

    await fillSeedFields(user)
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))

    await waitFor(() => expect(props.onCreated).toHaveBeenCalled())
    expect(createNpcMock.mock.calls[0]![1].connections.organizations).toEqual([
      { organizationId: organization.id },
    ])
  })

  it('lifts current values on Back for session preservation', async () => {
    const user = userEvent.setup()
    const { props } = renderForm()

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Half-entered')
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(props.onBack).toHaveBeenCalledWith(expect.objectContaining({ name: 'Half-entered' }))
    expect(createNpcMock).not.toHaveBeenCalled()
  })

  it('restores initial values passed from a previous session', () => {
    renderForm({
      initialValues: {
        name: 'Returning NPC',
        speciesId: populatedBuilderCatalog.species[0]!.id,
        classId: quickFighter.id,
        level: 3,
        alignment: 'ln',
        membershipTitle: 'Guildmaster',
      },
    })

    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Returning NPC')
    expect(screen.getByRole('spinbutton', { name: /level/i })).toHaveValue(3)
    expect(screen.getByRole('radio', { name: 'Guildmaster' })).toBeChecked()
  })

  it('surfaces builder issues inline and keeps the form open when resolution fails', async () => {
    const user = userEvent.setup()
    // Two skills required but only one authored option — automatic resolution stalls.
    const unsatisfiableFighter = {
      ...quickFighter,
      characterCreation: {
        proficiencies: {
          skills: {
            choices: [{ id: 'class-skills', choose: 2, from: ['athletics'] }],
          },
        },
      },
    }
    const { props } = renderForm({
      buildContext: buildContextFixture({ classes: [unsatisfiableFighter] }),
    })

    await fillSeedFields(user)
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/choose at least 2 options/i)
    expect(createNpcMock).not.toHaveBeenCalled()
    expect(props.onCreated).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Guard Captain')
  })

  it('keeps values and shows the fallback error when the create request fails', async () => {
    const user = userEvent.setup()
    createNpcMock.mockRejectedValue(new Error('Could not create NPC.'))
    const { props } = renderForm()

    await fillSeedFields(user)
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not create NPC.')
    expect(props.onCreated).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Guard Captain')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderForm()
    await expectNoAxeViolations(container)
  })
})
