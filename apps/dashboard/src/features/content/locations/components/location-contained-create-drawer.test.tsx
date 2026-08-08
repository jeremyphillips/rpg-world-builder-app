import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { makeTestQueryClient } from '@/test/render'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { HARBORFORD } from '../fixtures'
import { LocationContainedCreateDrawer } from './location-contained-create-drawer.client'

const mutateAsync = vi.fn()

vi.mock('../../lib/list/use-content-mutations', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useContentWriteMutation: () => ({
      mutateAsync,
      isPending: false,
    }),
  }
})

vi.mock('../../lib/forms/shells/content-form-shell-layout', () => ({
  ContentFormOptionsGate: ({ children }: { children: (ctx: object) => React.ReactNode }) =>
    children({
      campaignId: STORY_CAMPAIGN_ID,
      campaignRules: {},
      options: { locationEntities: [] },
    }),
}))

vi.mock('../../lib/campaign-access/campaign-access-section.client', () => ({
  CampaignAccessSection: () => null,
}))

function renderDrawer(onOpenChange = vi.fn()) {
  const queryClient = makeTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <LocationContainedCreateDrawer
        open
        onOpenChange={onOpenChange}
        authoringType="building"
        parentLocationId={HARBORFORD.id}
        campaignId={STORY_CAMPAIGN_ID}
      />
    </QueryClientProvider>,
  )
}

describe('LocationContainedCreateDrawer', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
  })

  it('renders the contextual add heading', () => {
    renderDrawer()
    expect(screen.getByRole('heading', { name: 'Add building' })).toBeInTheDocument()
  })
})
