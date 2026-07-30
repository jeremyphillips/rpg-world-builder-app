import { describe, expect, it } from 'vitest'

import {
  resolveCampaignsOverviewDescription,
  resolveCampaignsOverviewViewState,
} from './campaigns-overview-view'

describe('resolveCampaignsOverviewViewState', () => {
  it('classifies pending, error, empty, and populated states', () => {
    expect(
      resolveCampaignsOverviewViewState({ isPending: true, isError: false, campaigns: [] }),
    ).toBe('pending')
    expect(
      resolveCampaignsOverviewViewState({ isPending: false, isError: true, campaigns: [] }),
    ).toBe('error')
    expect(
      resolveCampaignsOverviewViewState({ isPending: false, isError: false, campaigns: [] }),
    ).toBe('empty')
    expect(
      resolveCampaignsOverviewViewState({
        isPending: false,
        isError: false,
        campaigns: [{ id: 'camp_1' } as never],
      }),
    ).toBe('populated')
  })
})

describe('resolveCampaignsOverviewDescription', () => {
  const copy = {
    description: 'Create and manage shared game worlds.',
    hasCampaignsDescription: 'Choose a campaign to continue, or start a new one.',
  }

  it('uses populated copy only when campaigns exist', () => {
    expect(resolveCampaignsOverviewDescription('populated', copy)).toBe(
      copy.hasCampaignsDescription,
    )
    expect(resolveCampaignsOverviewDescription('error', copy)).toBe(copy.description)
  })
})
