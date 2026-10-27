import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { makeCharacterClass } from '@/test/fixtures/factories/character-class'
import { makeOrganization } from '@/test/fixtures/factories/organization'
import { makeSpecies } from '@/test/fixtures/factories/species'
import { makeTestQueryClient } from '@/test/render'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import type * as UseClassesModule from '../../classes/hooks/use-classes'
import type * as UseSpeciesModule from '../../species/hooks/use-species'
import { useClasses } from '../../classes/hooks/use-classes'
import { useSpecies } from '../../species/hooks/use-species'
import { CITY_COUNCIL, CRAFT_GUILD } from '../fixtures'
import { OrganizationDetailContent } from './organization-detail'

vi.mock('@/components/layout/breadcrumb/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
}))
vi.mock(
  '../components/location-connections/organization-location-connections-detail-section',
  () => ({
    OrganizationLocationConnectionsDetailSection: () => (
      <div data-testid="organization-detail-section">Location connections</div>
    ),
  }),
)
vi.mock('../components/members/organization-members-detail-section', () => ({
  OrganizationMembersDetailSection: () => (
    <div data-testid="organization-detail-section">Members</div>
  ),
}))
vi.mock('../../classes/hooks/use-classes', async (importOriginal) => {
  const actual = await importOriginal<typeof UseClassesModule>()
  return { ...actual, useClasses: vi.fn() }
})
vi.mock('../../species/hooks/use-species', async (importOriginal) => {
  const actual = await importOriginal<typeof UseSpeciesModule>()
  return { ...actual, useSpecies: vi.fn() }
})

const useClassesMock = vi.mocked(useClasses)
const useSpeciesMock = vi.mocked(useSpecies)

function catalogQuery<T>(overrides: {
  data?: T
  isPending?: boolean
  isError?: boolean
  isLoadingError?: boolean
  isRefetchError?: boolean
  isSuccess?: boolean
  isFetching?: boolean
}) {
  return {
    data: overrides.data,
    isPending: overrides.isPending ?? false,
    isError: overrides.isError ?? false,
    isLoadingError: overrides.isLoadingError ?? false,
    isRefetchError: overrides.isRefetchError ?? false,
    isSuccess: overrides.isSuccess ?? false,
    isFetching: overrides.isFetching ?? false,
    error: null,
  }
}

function renderDetail(organization = CITY_COUNCIL) {
  const queryClient = makeTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OrganizationDetailContent organization={organization} campaignId={STORY_CAMPAIGN_ID} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('OrganizationDetailContent', () => {
  beforeEach(() => {
    useClassesMock.mockReturnValue(
      catalogQuery({ data: [], isSuccess: true }) as ReturnType<typeof useClasses>,
    )
    useSpeciesMock.mockReturnValue(
      catalogQuery({ data: [], isSuccess: true }) as ReturnType<typeof useSpecies>,
    )
  })

  it('renders kind metadata and the authored description', () => {
    renderDetail()
    expect(screen.getByText('Government')).toBeInTheDocument()
    expect(screen.getByText('The elected council governing the city.')).toBeInTheDocument()
  })

  it('orders Members, membership titles, and location connections', () => {
    renderDetail()
    expect(
      screen.getAllByTestId('organization-detail-section').map((el) => el.textContent),
    ).toEqual(['Members', 'Location connections'])
    const membersSection = screen.getAllByTestId('organization-detail-section')[0]!
    const titlesHeading = screen.getByRole('heading', { name: 'Membership titles' })
    const locationsSection = screen.getAllByTestId('organization-detail-section')[1]!

    expect(
      membersSection.compareDocumentPosition(titlesHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      titlesHeading.compareDocumentPosition(locationsSection) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('renders the membership title catalog in canonical order', () => {
    renderDetail()
    const list = screen.getByTestId('organization-membership-titles-list')
    const items = within(list)
      .getAllByRole('listitem')
      .map((item) => item.textContent)
    expect(items).toEqual(['Chair', 'Clerk'])
  })

  it('renders a single membership title in the catalog', () => {
    renderDetail(
      makeOrganization({
        members: {
          classAffinityIds: [],
          speciesAffinityIds: [],
          titles: [{ id: 'omt_member', label: 'Member', priority: 10 as const }],
        },
      }),
    )
    const list = screen.getByTestId('organization-membership-titles-list')
    expect(within(list).getByRole('listitem')).toHaveTextContent('Member')
  })

  it('replaces only the class affinity cell when classes fail their initial load', () => {
    useClassesMock.mockReturnValue(
      catalogQuery({
        data: undefined,
        isError: true,
        isLoadingError: true,
        isRefetchError: false,
        isSuccess: false,
      }) as ReturnType<typeof useClasses>,
    )
    useSpeciesMock.mockReturnValue(
      catalogQuery({
        data: [makeSpecies({ id: 'species-elf', slug: 'elf', name: 'Elf' })],
        isSuccess: true,
      }) as ReturnType<typeof useSpecies>,
    )

    renderDetail({
      ...CRAFT_GUILD,
      members: {
        ...CRAFT_GUILD.members,
        classAffinityIds: ['class-fighter'],
        speciesAffinityIds: ['species-elf'],
      },
    })

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load classes.')
    expect(screen.queryByText('Could not load species.')).not.toBeInTheDocument()
    expect(screen.getByText('Elf')).toBeInTheDocument()
    expect(screen.getByText('Occupational')).toBeInTheDocument()
    expect(screen.getByText('Standards · Training')).toBeInTheDocument()
  })

  it('keeps class affinity labels when a classes refetch fails', () => {
    useClassesMock.mockReturnValue(
      catalogQuery({
        data: [makeCharacterClass({ id: 'class-fighter', slug: 'fighter', name: 'Fighter' })],
        isError: true,
        isLoadingError: false,
        isRefetchError: true,
        isSuccess: false,
      }) as ReturnType<typeof useClasses>,
    )
    useSpeciesMock.mockReturnValue(
      catalogQuery({ data: [], isSuccess: true }) as ReturnType<typeof useSpecies>,
    )

    renderDetail({
      ...CRAFT_GUILD,
      members: {
        ...CRAFT_GUILD.members,
        classAffinityIds: ['class-fighter', 'class-missing'],
        speciesAffinityIds: [],
      },
    })

    expect(screen.getByText('Fighter · Class Missing · Unresolved reference')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Guild')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderDetail()
    await expectNoAxeViolations(container)
  })
})
