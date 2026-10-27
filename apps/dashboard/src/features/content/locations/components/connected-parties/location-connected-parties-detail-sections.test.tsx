import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { LocationConnectedPartyRow } from '@rpg/contracts'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { testRegionLocation } from '@/features/content/lib/fixtures/location-test-helpers'
import { STORY_CAMPAIGN_ID } from '@/test/fixtures/constants'

const { detailMock } = vi.hoisted(() => ({
  detailMock: vi.fn(),
}))

vi.mock('../../hooks/use-location-connected-parties-detail', () => ({
  useLocationConnectedPartiesDetail: detailMock,
  LOCATION_CONNECTED_PARTIES_MUTATION_ERROR:
    'Could not update connected parties for this location.',
}))

import { LocationConnectedPartiesDetailSections } from './location-connected-parties-detail-sections'

const location = testRegionLocation({ name: 'Lankhmar', slug: 'lankhmar' })

const councilRow: LocationConnectedPartyRow = {
  relationshipId: 'rel-org-1',
  subjectType: 'organization',
  subject: { type: 'organization', id: 'org-1', name: 'City Council', slug: 'council' },
  kind: 'governs',
  label: 'Governed by',
  family: 'territorial_authority',
  priority: 50,
  sectionGroup: 'territorial_authority',
}

function mockDetail(
  query: {
    isPending?: boolean
    isError?: boolean
    isLoadingError?: boolean
    isRefetchError?: boolean
    isSuccess?: boolean
    isFetching?: boolean
    data?: unknown
  },
  extras: {
    rows?: LocationConnectedPartyRow[]
    showTerritorialSection?: boolean
    mutationError?: string | null
  } = {},
) {
  detailMock.mockReturnValue({
    connectedPartiesQuery: {
      isPending: false,
      isError: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      isFetching: false,
      data: [],
      ...query,
    },
    rows: extras.rows ?? [councilRow],
    mutationError: extras.mutationError ?? null,
    showTerritorialSection: extras.showTerritorialSection ?? true,
    showPeopleSection: false,
    canManage: false,
    canWriteInverse: false,
    characterOptionsById: new Map(),
    isMutationPending: false,
    organizationCandidates: { items: [], isAuthoritativeDomainSet: true },
    canAddOrganizationInverse: false,
    canAddCharacter: false,
    organizationDrawerState: null,
    peopleDrawerState: null,
    characterDrawerState: null,
    peopleKindSlots: [],
    canAddToPeopleSection: false,
    canEditRow: () => false,
    handleRemoveConnection: vi.fn(),
    handleEditConnection: vi.fn(),
    handleChangeTerritorialKind: vi.fn(),
    handleReplaceTerritorialOrganization: vi.fn(),
    openTerritorialAddDrawer: vi.fn(),
    openPeopleSectionAdd: vi.fn(),
  })
}

function renderSections() {
  return render(
    <MemoryRouter>
      <LocationConnectedPartiesDetailSections campaignId={STORY_CAMPAIGN_ID} location={location} />
    </MemoryRouter>,
  )
}

describe('LocationConnectedPartiesDetailSections', () => {
  beforeEach(() => {
    detailMock.mockReset()
  })

  it('shows pending and the initial load error without the retained roster', () => {
    mockDetail({ isPending: true, isSuccess: false, data: undefined }, { rows: [] })
    const { rerender } = renderSections()

    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
    expect(screen.queryByText('City Council')).not.toBeInTheDocument()

    mockDetail(
      {
        isPending: false,
        isError: true,
        isLoadingError: true,
        isRefetchError: false,
        isSuccess: false,
        data: undefined,
      },
      { rows: [] },
    )
    rerender(
      <MemoryRouter>
        <LocationConnectedPartiesDetailSections
          campaignId={STORY_CAMPAIGN_ID}
          location={location}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load connected parties.')
    expect(screen.queryByText('City Council')).not.toBeInTheDocument()
  })

  it('keeps connected parties when a refetch fails', () => {
    mockDetail({
      isError: true,
      isLoadingError: false,
      isRefetchError: true,
      isSuccess: false,
      isFetching: false,
      data: [councilRow],
    })

    renderSections()

    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('omits the sections when a failed refetch still has an empty snapshot', () => {
    mockDetail(
      {
        isError: true,
        isLoadingError: false,
        isRefetchError: true,
        isSuccess: false,
        data: [],
      },
      { rows: [], showTerritorialSection: false },
    )

    renderSections()

    expect(screen.queryByText('City Council')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('keeps a mutation error with the loaded sections', () => {
    mockDetail({ data: [councilRow], isSuccess: true }, { mutationError: 'Could not update.' })

    renderSections()

    expect(screen.getByText('Could not update.')).toBeInTheDocument()
    expect(screen.getByText('City Council')).toBeInTheDocument()
  })
})
