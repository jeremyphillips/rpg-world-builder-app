import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { makeLocation } from '@/test/fixtures/factories/location'

import { ALDERMERE, HARBORFORD, LOCATIONS_LIST, YAWNING_PORTAL } from '../../fixtures'
import { LocationParentReplacementDrawer } from './location-parent-replacement-drawer.client'

function createMultiFamilyCampaignLocations() {
  const site = makeLocation({
    kind: 'site',
    id: 'location-site',
    slug: 'harbor-site',
    name: 'Harbor Site',
    parentLocationId: HARBORFORD.id,
  })

  const structureSibling = makeLocation({
    kind: 'structure',
    id: 'location-other-structure',
    slug: 'other-tavern',
    name: 'Other Tavern',
    structureType: 'building',
    parentLocationId: HARBORFORD.id,
  })

  const interior = makeLocation({
    kind: 'interior',
    id: 'location-interior',
    slug: 'taproom',
    name: 'Taproom',
    parentLocationId: YAWNING_PORTAL.id,
  })

  return {
    campaignLocations: [...LOCATIONS_LIST, site, structureSibling],
    subject: interior,
  }
}

describe('LocationParentReplacementDrawer', () => {
  it('shows current parent from parentLocationId and gates submit until a different parent is selected', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <LocationParentReplacementDrawer
        open
        onOpenChange={vi.fn()}
        subject={YAWNING_PORTAL}
        campaignLocations={LOCATIONS_LIST}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Change parent location' })).toBeInTheDocument()
    expect(screen.getByText('Current parent')).toBeInTheDocument()
    expect(screen.getByText('Dock Ward')).toBeInTheDocument()
    expect(screen.getByText('New parent')).toBeInTheDocument()
    expect(screen.getByText('Choose a new parent for this location.')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search locations…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change parent location' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Select' })).not.toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Select' }))

    expect(screen.getByRole('button', { name: 'Change parent location' })).toBeEnabled()
    expect(screen.getAllByText('Dock Ward')).toHaveLength(1)
  })

  it('opens set-parent chrome without a current parent summary', async () => {
    const user = userEvent.setup()
    const plane = makeLocation({
      kind: 'plane',
      id: 'location-plane',
      slug: 'material-plane',
      name: 'Material Plane',
    })

    render(
      <LocationParentReplacementDrawer
        open
        onOpenChange={vi.fn()}
        subject={ALDERMERE}
        campaignLocations={[...LOCATIONS_LIST, plane]}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Set parent location' })).toBeInTheDocument()
    expect(screen.queryByText('Current parent')).not.toBeInTheDocument()
    expect(screen.getByText('New parent')).toBeInTheDocument()
    expect(screen.getByText('Choose a parent for this location.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Set parent location' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Select' }))
    expect(screen.getByRole('button', { name: 'Set parent location' })).toBeEnabled()
  })

  it('lists Harborford as a valid replacement parent for Yawning Portal', async () => {
    const user = userEvent.setup()

    render(
      <LocationParentReplacementDrawer
        open
        onOpenChange={vi.fn()}
        subject={YAWNING_PORTAL}
        campaignLocations={LOCATIONS_LIST}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Harborford')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Select' }))
    expect(screen.getByRole('button', { name: 'Change parent location' })).toBeEnabled()
  })

  it('shows candidate-universe browse scopes when multiple families are present', () => {
    const { campaignLocations, subject } = createMultiFamilyCampaignLocations()

    render(
      <LocationParentReplacementDrawer
        open
        onOpenChange={vi.fn()}
        subject={subject}
        campaignLocations={campaignLocations}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sites' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Structures' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Settlements' })).not.toBeInTheDocument()
  })

  it('filters candidates by active browse scope', async () => {
    const user = userEvent.setup()
    const { campaignLocations, subject } = createMultiFamilyCampaignLocations()

    render(
      <LocationParentReplacementDrawer
        open
        onOpenChange={vi.fn()}
        subject={subject}
        campaignLocations={campaignLocations}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Harbor Site')).toBeInTheDocument()
    expect(screen.getByText('Other Tavern')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sites' }))

    expect(screen.getByText('Harbor Site')).toBeInTheDocument()
    expect(screen.queryByText('Other Tavern')).not.toBeInTheDocument()
  })

  it('preserves search query when switching parent browse scopes', async () => {
    const user = userEvent.setup()
    const { campaignLocations, subject } = createMultiFamilyCampaignLocations()

    render(
      <LocationParentReplacementDrawer
        open
        onOpenChange={vi.fn()}
        subject={subject}
        campaignLocations={campaignLocations}
        onSubmit={vi.fn()}
      />,
    )

    const searchInput = screen.getByPlaceholderText('Search locations…')
    await user.type(searchInput, 'Har')
    expect(searchInput).toHaveValue('Har')

    await user.click(screen.getByRole('button', { name: 'Sites' }))
    expect(searchInput).toHaveValue('Har')

    await user.click(screen.getByRole('button', { name: 'Structures' }))
    expect(searchInput).toHaveValue('Har')
  })

  it('uses Move chrome and blocks submit when expected parent mismatches authority', () => {
    render(
      <LocationParentReplacementDrawer
        open
        onOpenChange={vi.fn()}
        subject={YAWNING_PORTAL}
        campaignLocations={LOCATIONS_LIST}
        surface="move"
        expectedParentLocationId="not-the-parent"
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Move Yawning Portal' })).toBeInTheDocument()
    expect(screen.getByText('Choose where to move Yawning Portal.')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This location’s parent no longer matches this page. Refresh the locations list and try again.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Move location' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Select' })).not.toBeInTheDocument()
  })
})
