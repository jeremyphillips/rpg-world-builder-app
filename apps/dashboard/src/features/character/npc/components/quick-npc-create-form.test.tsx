import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import type { CharacterBuildContext } from '@rpg/contracts'

import { makeCampaignNpcDetail } from '@/test/fixtures/factories/additional/character'

import { renderWithProviders } from '@/test/render'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import { createNpc } from '../api/npc-client'
import type * as NpcClient from '../api/npc-client'
import { FormShellFooterScope, FormShellFooterSlot } from '@rpg/ui/form'

import { QuickNpcAuthoringForm } from './quick-npc-authoring-form.client'

vi.mock('../api/npc-client', async (importOriginal) => ({
  ...(await importOriginal<typeof NpcClient>()),
  createNpc: vi.fn(),
}))

const createNpcMock = vi.mocked(createNpc)

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
  organizationDomain: 'occupational' as const,
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
  organizationDomain: organization.organizationDomain,
  functions: [],
  practices: [],
  memberClassAffinityIds: [],
  memberSpeciesAffinityIds: [],
  connections: { locations: [] },
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

const setup = {
  speciesId: populatedBuilderCatalog.species[0]!.id,
  classId: quickFighter.id,
  level: 1,
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

const setupSummaryLine = 'Dwarf · Level 1 Fighter'

const npcDetail = makeCampaignNpcDetail({
  character: { id: 'npc-99', name: 'Guard Captain' },
  participation: { id: 'participation-99' },
})

function renderForm(overrides: Partial<React.ComponentProps<typeof QuickNpcAuthoringForm>> = {}) {
  const props = {
    campaignId: CAMPAIGN_ID,
    buildContext: buildContextFixture(),
    organization,
    setup,
    setupSummaryLine,
    onCancel: vi.fn(),
    onChangeSetup: vi.fn(),
    onCreated: vi.fn(),
    ...overrides,
  }

  return {
    props,
    ...renderWithProviders(
      <FormShellFooterScope>
        <QuickNpcAuthoringForm {...props} />
        <FormShellFooterSlot />
      </FormShellFooterScope>,
    ),
  }
}

async function fillAuthoringFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: /name/i }), 'Guard Captain')
  await user.click(screen.getByRole('combobox', { name: /alignment/i }))
  await user.click(screen.getByRole('option', { name: /lawful neutral/i }))
}

describe('QuickNpcAuthoringForm', () => {
  beforeEach(() => {
    createNpcMock.mockReset()
    createNpcMock.mockResolvedValue(npcDetail)
  })

  it('renders the details tab with Neutral alignment default and membership title options', () => {
    renderForm()

    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /alignment/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'No title' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Guildmaster' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create NPC' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
  })

  it('creates the NPC atomically with the titled membership connection', async () => {
    const user = userEvent.setup()
    const { props } = renderForm()

    await fillAuthoringFields(user)
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

  it('calls onChangeSetup from the setup summary Change action', async () => {
    const user = userEvent.setup()
    const { props } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Change' }))
    expect(props.onChangeSetup).toHaveBeenCalledTimes(1)
    expect(createNpcMock).not.toHaveBeenCalled()
  })

  it('surfaces builder issues inline and keeps the form open when resolution fails', async () => {
    const user = userEvent.setup()
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
      setup: { ...setup, classId: unsatisfiableFighter.id },
    })

    await fillAuthoringFields(user)
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/choose at least 2 options/i)
    expect(createNpcMock).not.toHaveBeenCalled()
    expect(props.onCreated).not.toHaveBeenCalled()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderForm()
    await expectNoAxeViolations(container)
  })
})
