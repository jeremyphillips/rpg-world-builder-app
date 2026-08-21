import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ALDERMERE, HARBORFORD, LOCATIONS_LIST, YAWNING_PORTAL } from '../../fixtures'
import { buildLocationDetailViewModel } from '../../lib/location-display'
import { LOCATION_UNCONTAINED_LABEL } from '../../lib/hierarchy/location-parent-replacement-surface-copy'
import { LocationDetailIdentity } from './location-detail-identity'

const CAMPAIGN_ID = 'camp_1'

describe('LocationDetailIdentity parent replacement action', () => {
  it('shows Change parent for managed locations with a persisted parent', () => {
    const onParentReplacementAction = vi.fn()
    const identity = buildLocationDetailViewModel(YAWNING_PORTAL, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
      canManage: true,
    }).identity

    render(
      <MemoryRouter>
        <LocationDetailIdentity
          identity={identity}
          onParentReplacementAction={onParentReplacementAction}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Dock Ward' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change parent' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View parent' })).not.toBeInTheDocument()
  })

  it('shows uncontained copy and Set parent when the location has no parent', () => {
    const identity = buildLocationDetailViewModel(ALDERMERE, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
      canManage: true,
    }).identity

    render(
      <MemoryRouter>
        <LocationDetailIdentity identity={identity} onParentReplacementAction={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByText(LOCATION_UNCONTAINED_LABEL)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Set parent' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Aldermere' })).not.toBeInTheDocument()
  })

  it('hides parent actions for non-managers', () => {
    const identity = buildLocationDetailViewModel(HARBORFORD, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
      canManage: false,
    }).identity

    render(
      <MemoryRouter>
        <LocationDetailIdentity identity={identity} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Greyshore' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change parent' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Set parent' })).not.toBeInTheDocument()
  })

  it('invokes the parent replacement handler from the inline action', async () => {
    const user = userEvent.setup()
    const onParentReplacementAction = vi.fn()
    const identity = buildLocationDetailViewModel(YAWNING_PORTAL, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
      canManage: true,
    }).identity

    render(
      <MemoryRouter>
        <LocationDetailIdentity
          identity={identity}
          onParentReplacementAction={onParentReplacementAction}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Change parent' }))
    expect(onParentReplacementAction).toHaveBeenCalledTimes(1)
  })
})
