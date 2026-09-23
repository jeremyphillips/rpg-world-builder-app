import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import {
  CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
  createEmptyCharacterBuilderDraft,
} from '@rpg/contracts'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createCampaignNpcBuilderContextFixture } from '../../../../lib/fixtures/character-builder-fixtures'
import {
  cityCouncil,
  lanternGuild,
} from '../../../connections/picker/organization-picker-drawer.fixtures'
import { harborfordSettlement } from '../../../connections/picker/residence-location-picker-drawer.fixtures'
import { ConnectionsStep } from './connections-step'

const campaignContext = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...createCampaignNpcBuilderContextFixture().catalog,
    organizations: [lanternGuild, cityCouncil],
  },
})

const locationsQueryState = vi.hoisted(() => ({
  data: undefined as (typeof harborfordSettlement)[] | undefined,
  isPending: false,
  isError: false,
  error: null as Error | null,
}))

const campaignCharactersQueryState = vi.hoisted(() => ({
  data: [] as Array<{
    character: { id: string; name: string; summary: string; classIds: string[] }
    controller: null
    roster: { status: 'active' }
  }>,
  isPending: false,
}))

const npcsQueryState = vi.hoisted(() => ({
  data: [] as Array<{
    character: {
      id: string
      name: string
      classes: Array<{ classId: string }>
      species: { id: string }
    }
  }>,
  isPending: false,
}))

vi.mock('@/features/content/locations', () => ({
  useLocations: () => locationsQueryState,
  locationsQueryKey: (campaignId: string) => ['locations', campaignId],
}))

vi.mock('@/features/campaign', () => ({
  useCampaignCharacters: () => campaignCharactersQueryState,
  campaignCharactersListQueryKey: (campaignId: string) => ['campaign-characters', campaignId],
}))

vi.mock('../../../../npc/hooks/use-npcs', () => ({
  useNpcs: () => npcsQueryState,
  npcsQueryKey: (campaignId: string) => ['npcs', campaignId],
}))

function renderConnectionsStep(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ConnectionsStep', () => {
  beforeEach(() => {
    locationsQueryState.data = [harborfordSettlement]
    locationsQueryState.isPending = false
    locationsQueryState.isError = false
    locationsQueryState.error = null
    campaignCharactersQueryState.data = []
    campaignCharactersQueryState.isPending = false
    npcsQueryState.data = []
    npcsQueryState.isPending = false
  })

  it('renders four connection sections with split add controls', () => {
    renderConnectionsStep(
      <ConnectionsStep
        context={campaignContext}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    expect(screen.getByText('People')).toBeInTheDocument()
    expect(screen.getByText('Organizations')).toBeInTheDocument()
    expect(screen.getByText('Places')).toBeInTheDocument()
    expect(screen.getByText('Property')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add person' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add organization' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add place' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument()
  })

  it('lists organization memberships with overflow remove actions', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      relationshipEdges: [
        {
          id: 'edge-org-1',
          kind: 'organizationMembership' as const,
          characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
          organizationId: lanternGuild.id,
          details: { lifecycle: 'current' as const, title: 'Guildmaster' },
        },
      ],
    }

    renderConnectionsStep(
      <ConnectionsStep
        context={campaignContext}
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    expect(screen.getByText('Lantern Guild')).toBeInTheDocument()
    expect(screen.getByText('Guildmaster')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Actions for Lantern Guild/ }))
    await user.click(screen.getByRole('menuitem', { name: 'Remove connection' }))
    expect(onDraftChange).toHaveBeenCalledWith({ relationshipEdges: [] })
  })

  it('opens the parent shortcut menu from the people split button', async () => {
    const user = userEvent.setup()

    renderConnectionsStep(
      <ConnectionsStep
        context={campaignContext}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add person shortcuts' }))
    expect(screen.getByRole('menuitem', { name: 'Add parent' })).toBeInTheDocument()
  })

  it('disables place and property add while locations are loading', () => {
    locationsQueryState.data = undefined
    locationsQueryState.isPending = true

    renderConnectionsStep(
      <ConnectionsStep
        context={campaignContext}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Add place' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Add property' })).toBeDisabled()
  })

  it('has no axe violations in the populated state', async () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      relationshipEdges: [
        {
          id: 'edge-org-1',
          kind: 'organizationMembership' as const,
          characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
          organizationId: lanternGuild.id,
        },
      ],
    }
    const { container } = renderConnectionsStep(
      <ConnectionsStep
        context={campaignContext}
        draft={draft}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
