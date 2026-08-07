import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Location } from '@rpg/contracts'
import { toast } from '@rpg/ui'

import type * as RpgUi from '@rpg/ui'

import { makeTestQueryClient } from '@/test/render'
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

vi.mock('@rpg/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof RpgUi>()
  return {
    ...actual,
    toast: {
      ...actual.toast,
      warning: vi.fn(),
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

    const heading = screen.getByRole('heading', { name: 'Contained locations' })
    const section = heading.closest('section')
    expect(section).toHaveAttribute('aria-labelledby', 'location-children-heading')
    expect(screen.getByRole('link', { name: 'Dock Ward' })).toBeInTheDocument()
    const dockWardLink = screen.getByRole('link', { name: 'Dock Ward' })
    expect(dockWardLink.parentElement?.parentElement).toHaveTextContent('Dock Ward·District')
    expect(screen.getByText('District')).toBeInTheDocument()
    expect(screen.getByText('Locations directly within this location.')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'View' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Actions for Dock Ward' })).not.toBeInTheDocument()
  })

  it('shows View location + Move location overflow for managers', async () => {
    const user = userEvent.setup()
    renderSection({ canManage: true })

    expect(screen.queryByRole('link', { name: 'View' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Actions for Yawning Portal' }))
    expect(screen.getByRole('menuitem', { name: 'View location' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Move location' })).toBeInTheDocument()
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
        { parentLocationId: HARBORFORD.id },
      )
      expect(invalidateSpy).toHaveBeenCalled()
    })
  })
})
