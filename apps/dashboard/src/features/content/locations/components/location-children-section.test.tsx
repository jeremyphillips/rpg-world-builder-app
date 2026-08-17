import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Location } from '@rpg/contracts'
import { ApiError } from '@rpg/contracts'
import { toast } from '@rpg/ui'

import type * as RpgUi from '@rpg/ui'

import { makeTestQueryClient } from '@/test/render'
import { makeLocation } from '@/test/fixtures/factories/location'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { DOCK_WARD, HARBORFORD, LOCATIONS_LIST, YAWNING_PORTAL } from '../fixtures'
import { buildLocationDetailViewModel } from '../lib/location-display'
import { LOCATION_PARENT_REPLACEMENT_DRAWER } from '../lib/location-parent-replacement-surface-copy'
import { LocationChildrenSection } from './location-children-section.client'

const { mockUpdateContent } = vi.hoisted(() => ({
  mockUpdateContent: vi.fn(),
}))

vi.mock('../../lib/list/content-client', () => ({
  updateContent: mockUpdateContent,
}))

vi.mock('./location-create-modal.client', () => ({
  LocationCreateModal: ({
    intent,
    open,
  }: {
    intent: { authoringType: string; parentLocationId?: string }
    open: boolean
  }) =>
    open ? (
      <div role="dialog">
        Create modal: {intent.authoringType}
        {intent.parentLocationId ? ` parent=${intent.parentLocationId}` : null}
      </div>
    ) : null,
}))

vi.mock('@rpg/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof RpgUi>()
  return {
    ...actual,
    toast: {
      ...actual.toast,
      warning: vi.fn(),
      error: vi.fn(),
    },
  }
})

function renderSection(input?: {
  canManage?: boolean
  parent?: Location
  parentLocationId?: string
  campaignLocations?: readonly Location[]
}) {
  const parent = input?.parent ?? DOCK_WARD
  const childrenViewModel = buildLocationDetailViewModel(parent, {
    locations: LOCATIONS_LIST,
    campaignId: STORY_CAMPAIGN_ID,
  }).children

  const queryClient = makeTestQueryClient()
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

  const view = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LocationChildrenSection
          childrenViewModel={childrenViewModel}
          canManage={input?.canManage ?? false}
          parentLocationId={input?.parentLocationId ?? parent.id}
          parentKind={parent.kind}
          campaignId={STORY_CAMPAIGN_ID}
          campaignLocations={input?.campaignLocations ?? LOCATIONS_LIST}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  )

  return { ...view, invalidateSpy }
}

describe('LocationChildrenSection', () => {
  beforeEach(() => {
    mockUpdateContent.mockReset()
    vi.mocked(toast.warning).mockReset()
  })

  it('shows heading links for non-managers without Move overflow', () => {
    renderSection({ canManage: false, parent: HARBORFORD })

    const heading = screen.getByRole('heading', { name: 'City structure', level: 2 })
    const section = heading.closest('section')
    expect(section).toHaveAttribute('aria-labelledby', 'location-children-heading')
    expect(screen.getByRole('link', { name: 'Dock Ward' })).toBeInTheDocument()
    const dockWardLink = screen.getByRole('link', { name: 'Dock Ward' })
    expect(dockWardLink.parentElement?.parentElement).toHaveTextContent(
      /Dock Ward.*District.*1 location/,
    )
    expect(
      screen.getByText('Districts and locations organized within this city.'),
    ).toBeInTheDocument()

    const districtsLabel = screen.getByText('Districts')
    expect(districtsLabel.tagName).toBe('P')
    expect(screen.queryByRole('heading', { name: 'Districts' })).not.toBeInTheDocument()
    expect(screen.getByText('Direct locations').tagName).toBe('P')

    expect(screen.queryByRole('link', { name: 'View' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Actions for Dock Ward' })).not.toBeInTheDocument()
  })

  it('shows district child counts and reveals immediate children on expand', async () => {
    const user = userEvent.setup()
    renderSection({ canManage: false, parent: HARBORFORD })

    const dockWardRow = screen.getByRole('link', { name: 'Dock Ward' }).parentElement?.parentElement
    expect(dockWardRow).toHaveTextContent(/1 location/)
    expect(screen.queryByRole('link', { name: 'Yawning Portal' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show locations in Dock Ward' }))

    expect(screen.getByRole('link', { name: 'Yawning Portal' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Actions for Yawning Portal' }),
    ).not.toBeInTheDocument()

    const previewGroup = screen
      .getByRole('link', { name: 'Yawning Portal' })
      .closest('[class*="border-l"]')
    expect(previewGroup).toHaveClass('border-l', 'border-border-subtle', 'pl-3')
  })

  it('shows zero-child districts with reserved disclosure gutter and no chevron', () => {
    const marketWard = makeLocation({
      kind: 'district',
      id: 'location-market-ward',
      slug: 'market-ward',
      name: 'Market Ward',
      parentLocationId: HARBORFORD.id,
    })

    const childrenViewModel = buildLocationDetailViewModel(HARBORFORD, {
      locations: [...LOCATIONS_LIST, marketWard],
      campaignId: STORY_CAMPAIGN_ID,
    }).children

    render(
      <QueryClientProvider client={makeTestQueryClient()}>
        <MemoryRouter>
          <LocationChildrenSection
            childrenViewModel={childrenViewModel}
            canManage={false}
            parentLocationId={HARBORFORD.id}
            parentKind={HARBORFORD.kind}
            campaignId={STORY_CAMPAIGN_ID}
            campaignLocations={[...LOCATIONS_LIST, marketWard]}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    const marketWardRow = screen.getByRole('link', { name: 'Market Ward' }).parentElement
      ?.parentElement
    const marketWardLink = screen.getByRole('link', { name: 'Market Ward' })
    expect(marketWardLink.closest('[style]')).toBeInTheDocument()
    expect(marketWardRow).toHaveTextContent(/0 locations/)
    expect(
      screen.queryByRole('button', { name: 'Show locations in Market Ward' }),
    ).not.toBeInTheDocument()
  })

  it('shows Add district on the Districts subgroup when settlement hierarchy allows it', async () => {
    const user = userEvent.setup()
    renderSection({ canManage: true, parent: HARBORFORD })

    const addDistrict = screen.getByRole('button', { name: 'Add district' })
    expect(addDistrict).toBeInTheDocument()

    await user.click(addDistrict)

    expect(screen.getByText(`Create modal: district parent=${HARBORFORD.id}`)).toBeInTheDocument()
  })

  it('keeps Add district on empty Districts subgroup headers', () => {
    const emptyHarborfordViewModel = buildLocationDetailViewModel(HARBORFORD, {
      locations: [HARBORFORD],
      campaignId: STORY_CAMPAIGN_ID,
    }).children

    render(
      <QueryClientProvider client={makeTestQueryClient()}>
        <MemoryRouter>
          <LocationChildrenSection
            childrenViewModel={emptyHarborfordViewModel}
            canManage
            parentLocationId={HARBORFORD.id}
            parentKind={HARBORFORD.kind}
            campaignId={STORY_CAMPAIGN_ID}
            campaignLocations={[HARBORFORD]}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('button', { name: 'Add district' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add location' })).toBeInTheDocument()
    expect(screen.getByText('No districts yet.')).toBeInTheDocument()
    expect(screen.getByText('No direct locations yet.')).toBeInTheDocument()
    expect(screen.queryByText('No locations yet.')).not.toBeInTheDocument()
  })

  it('launches contained create under the district when row Add location chooses Building', async () => {
    const user = userEvent.setup()
    renderSection({ canManage: true, parent: HARBORFORD })

    await user.click(screen.getByRole('button', { name: 'Show locations in Dock Ward' }))
    expect(screen.getByRole('link', { name: 'Yawning Portal' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add location to Dock Ward' }))
    expect(screen.getByText('Add to Dock Ward')).toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: 'Building' }))

    expect(screen.getByText(`Create modal: building parent=${DOCK_WARD.id}`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide locations in Dock Ward' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Yawning Portal' })).toBeInTheDocument()
  })

  it('keeps district overflow beside the Add location utility action', () => {
    renderSection({ canManage: true, parent: HARBORFORD })

    expect(screen.getByRole('button', { name: 'Add location to Dock Ward' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Actions for Dock Ward' })).toBeInTheDocument()
  })

  it('omits Add district when the parent kind cannot author districts', () => {
    renderSection({ canManage: true, parent: DOCK_WARD })

    expect(screen.queryByRole('button', { name: 'Add district' })).not.toBeInTheDocument()
  })

  it('omits Add district for non-managers even on settlements', () => {
    renderSection({ canManage: false, parent: HARBORFORD })

    expect(screen.queryByRole('button', { name: 'Add district' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add location' })).not.toBeInTheDocument()
  })

  it('omits panel-level Add location on City structure and scopes it to Direct locations', async () => {
    const user = userEvent.setup()
    renderSection({ canManage: true, parent: HARBORFORD })

    expect(screen.getByRole('button', { name: 'Add district' })).toBeInTheDocument()
    const addLocation = screen.getByRole('button', { name: 'Add location' })
    expect(addLocation).toBeInTheDocument()

    await user.click(addLocation)
    expect(screen.queryByRole('menuitem', { name: 'District' })).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Building' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Site' })).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'Building' }))
    expect(screen.getByText(`Create modal: building parent=${HARBORFORD.id}`)).toBeInTheDocument()
  })

  it('shows View location + Move location overflow for managers', async () => {
    const user = userEvent.setup()
    renderSection({ canManage: true })

    expect(screen.queryByRole('link', { name: 'View' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Actions for Yawning Portal' }))
    expect(screen.getByRole('menuitem', { name: 'View location' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Move location' })).toBeInTheDocument()
  })

  it('opens the contained create modal from structure panel Add location', async () => {
    const user = userEvent.setup()
    renderSection({ canManage: true, parent: DOCK_WARD })

    await user.click(screen.getByRole('button', { name: /^add location$/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Building' }))

    expect(screen.getByText(`Create modal: building parent=${DOCK_WARD.id}`)).toBeInTheDocument()
  })

  it('opens Move drawer wired to the child id with Current from parentLocationId', async () => {
    const user = userEvent.setup()
    renderSection({ canManage: true })

    await user.click(screen.getByRole('button', { name: 'Actions for Yawning Portal' }))
    await user.click(screen.getByRole('menuitem', { name: 'Move location' }))

    expect(screen.getByRole('dialog', { name: 'Move Yawning Portal' })).toBeInTheDocument()
    expect(screen.getByText('Current parent')).toBeInTheDocument()
    expect(screen.getByText('Dock Ward')).toBeInTheDocument()
    expect(screen.getByText('Choose where to move Yawning Portal.')).toBeInTheDocument()
    expect(screen.getByText('Harborford')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Move location' })).toBeDisabled()
  })

  it('blocks Move open and refreshes when child parentLocationId mismatches the open parent', async () => {
    const user = userEvent.setup()
    const { invalidateSpy } = renderSection({
      canManage: true,
      parent: DOCK_WARD,
      parentLocationId: DOCK_WARD.id,
      campaignLocations: LOCATIONS_LIST.map((location) =>
        location.id === YAWNING_PORTAL.id
          ? { ...YAWNING_PORTAL, parentLocationId: HARBORFORD.id }
          : location,
      ),
    })

    await user.click(screen.getByRole('button', { name: 'Actions for Yawning Portal' }))
    await user.click(screen.getByRole('menuitem', { name: 'Move location' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(toast.warning).toHaveBeenCalledWith(LOCATION_PARENT_REPLACEMENT_DRAWER.mismatchToast)
    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('invalidates locations after a successful Move submit', async () => {
    const user = userEvent.setup()
    mockUpdateContent.mockResolvedValue(YAWNING_PORTAL)
    const { invalidateSpy } = renderSection({ canManage: true })

    await user.click(screen.getByRole('button', { name: 'Actions for Yawning Portal' }))
    await user.click(screen.getByRole('menuitem', { name: 'Move location' }))
    await user.click(screen.getByRole('button', { name: 'Select' }))
    await user.click(screen.getByRole('button', { name: 'Move location' }))

    await waitFor(() => {
      expect(mockUpdateContent).toHaveBeenCalledWith(
        STORY_CAMPAIGN_ID,
        'locations',
        YAWNING_PORTAL.id,
        expect.objectContaining({ parentLocationId: HARBORFORD.id }),
      )
      expect(invalidateSpy).toHaveBeenCalled()
    })
  })

  it('toasts and keeps the Move drawer open when submit fails', async () => {
    const user = userEvent.setup()
    mockUpdateContent.mockRejectedValue(
      new ApiError(400, 'invalid_hierarchy', 'District cannot nest under another district.'),
    )
    renderSection({ canManage: true })

    await user.click(screen.getByRole('button', { name: 'Actions for Yawning Portal' }))
    await user.click(screen.getByRole('menuitem', { name: 'Move location' }))
    await user.click(screen.getByRole('button', { name: 'Select' }))
    await user.click(screen.getByRole('button', { name: 'Move location' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('District cannot nest under another district.')
    })
    expect(screen.getByRole('dialog', { name: 'Move Yawning Portal' })).toBeInTheDocument()
  })
})
