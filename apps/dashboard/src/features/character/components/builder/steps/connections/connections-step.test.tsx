import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  createStandaloneBuilderContextFixture,
} from '../../../../lib/fixtures/character-builder-fixtures'
import {
  cityCouncil,
  lanternGuild,
} from '../../../connections/picker/organization-picker-drawer.fixtures'
import { harborfordSettlement } from '../../../connections/picker/residence-location-picker-drawer.fixtures'
import { ConnectionsStep } from './connections-step'

const standaloneContext = createStandaloneBuilderContextFixture({
  catalog: {
    ...createStandaloneBuilderContextFixture().catalog,
    organizations: [lanternGuild, cityCouncil],
  },
})

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

vi.mock('@/features/content/locations', () => ({
  useLocations: () => locationsQueryState,
  locationsQueryKey: (campaignId: string) => ['locations', campaignId],
}))

describe('ConnectionsStep', () => {
  beforeEach(() => {
    locationsQueryState.data = [harborfordSettlement]
    locationsQueryState.isPending = false
    locationsQueryState.isError = false
    locationsQueryState.error = null
  })

  it('adds titled memberships and removes them from the summary', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      connections: {
        organizations: [{ organizationId: lanternGuild.id, title: 'Guildmaster' }],
        locations: [],
      },
    }

    render(
      <ConnectionsStep
        context={standaloneContext}
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    expect(screen.getByText('Organizations')).toBeInTheDocument()
    expect(screen.getByText('Lantern Guild')).toBeInTheDocument()
    expect(screen.getAllByText('Guildmaster').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: /Remove .*Lantern Guild/ }))
    expect(onDraftChange).toHaveBeenCalledWith({
      connections: { organizations: [], locations: [] },
    })

    await user.click(screen.getByRole('button', { name: 'Add organization' }))
    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)
    expect(onDraftChange).not.toHaveBeenCalledWith(
      expect.objectContaining({
        connections: expect.objectContaining({
          organizations: expect.arrayContaining([
            expect.objectContaining({ organizationId: cityCouncil.id }),
          ]),
        }),
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Add organization' }))
    expect(onDraftChange).toHaveBeenCalledWith({
      connections: {
        organizations: [{ organizationId: cityCouncil.id }],
        locations: [],
      },
    })
    expect(screen.getByRole('button', { name: 'Expand City Council' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('adds and removes residence connections in campaign context', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()

    render(
      <ConnectionsStep
        context={campaignContext}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    expect(screen.getByText('Residence')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add residence' }))
    await user.click(screen.getAllByRole('button', { name: 'Add' }).at(-1)!)

    expect(onDraftChange).toHaveBeenCalledWith({
      connections: {
        organizations: [],
        locations: [
          expect.objectContaining({
            locationId: harborfordSettlement.id,
            kind: 'resides_at',
          }),
        ],
      },
    })
    expect(screen.getByRole('button', { name: 'Expand Harborford' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('shows stale selections as recoverable and has no axe violations', async () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      connections: { organizations: [{ organizationId: 'organization-missing' }], locations: [] },
    }
    const { container } = render(
      <ConnectionsStep
        context={standaloneContext}
        draft={draft}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    expect(screen.getByText('organization-missing')).toBeInTheDocument()
    expect(screen.getByText('Missing organization')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Remove .*organization-missing/ }),
    ).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })

  it('disables residence add while locations are loading in campaign context', () => {
    locationsQueryState.data = undefined
    locationsQueryState.isPending = true

    render(
      <ConnectionsStep
        context={campaignContext}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    expect(screen.getAllByText('Loading residence locations…').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Add residence' })).toBeDisabled()
  })

  it('disables residence add when the locations query fails in campaign context', () => {
    locationsQueryState.data = undefined
    locationsQueryState.isPending = false
    locationsQueryState.isError = true
    locationsQueryState.error = new Error('Could not load locations.')

    render(
      <ConnectionsStep
        context={campaignContext}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    expect(screen.getAllByText('Could not load locations.').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Add residence' })).toBeDisabled()
  })

  it('renders the optional empty selection state', () => {
    render(
      <ConnectionsStep
        context={standaloneContext}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    expect(screen.getByText('No organization added.')).toBeInTheDocument()
    expect(
      screen.getAllByText('Choose a campaign to link a residence location.').length,
    ).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Add organization' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add residence' })).toBeDisabled()
  })
})
