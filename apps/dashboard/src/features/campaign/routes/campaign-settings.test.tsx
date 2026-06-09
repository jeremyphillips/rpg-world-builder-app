import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { Campaign } from '@rpg/contracts'

vi.mock('../api/campaign-client', () => ({
  listCampaigns: vi.fn(),
  updateCampaign: vi.fn(),
}))

import {
  listCampaigns as listCampaignsFn,
  updateCampaign as updateCampaignFn,
} from '../api/campaign-client'
import * as apiClient from '@/lib/api-client'
import { CampaignSettings } from './campaign-settings'

const listCampaigns = vi.mocked(listCampaignsFn)
const updateCampaign = vi.mocked(updateCampaignFn)

const campaign: Campaign = {
  id: 'c1',
  identity: { name: 'Sunless Citadel', description: 'A dungeon delve.' },
  configuration: {
    settings: {
      characterCreation: {
        startingLevel: 2,
        importedCharacters: { policy: 'disabled' },
      },
    },
  },
  status: 'active',
  visibility: 'private',
  createdBy: 'u1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderSettings(campaignId = 'c1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/campaigns/${campaignId}/settings`]}>
        <Routes>
          <Route path="/campaigns/:campaignId/settings" element={<CampaignSettings />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CampaignSettings', () => {
  beforeEach(() => {
    listCampaigns.mockReset()
    updateCampaign.mockReset()
    listCampaigns.mockResolvedValue([campaign])
    vi.spyOn(apiClient, 'uploadFile').mockResolvedValue('banner.webp')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('pre-fills the campaign name from the loaded campaign', async () => {
    renderSettings()
    expect(await screen.findByDisplayValue('Sunless Citadel')).toBeInTheDocument()
    expect(screen.getByDisplayValue('A dungeon delve.')).toBeInTheDocument()
  })

  it('shows the saved banner preview when the campaign has an imageKey', async () => {
    listCampaigns.mockResolvedValue([
      { ...campaign, identity: { ...campaign.identity, imageKey: 'banner.jpg' } },
    ])
    renderSettings()
    const img = await screen.findByRole('img', { name: 'Current campaign image' })
    expect(img).toHaveAttribute('src', '/api/uploads/banner.jpg')
  })

  it('calls updateCampaign with the current values on submit', async () => {
    const user = userEvent.setup()
    updateCampaign.mockResolvedValue(campaign)
    renderSettings()

    await screen.findByDisplayValue('Sunless Citadel')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(updateCampaign).toHaveBeenCalledTimes(1))
    expect(updateCampaign.mock.lastCall?.[1]).toMatchObject({
      name: 'Sunless Citadel',
      description: 'A dungeon delve.',
    })
  })

  it('shows not found when the campaign id is missing from the list', async () => {
    renderSettings('missing')
    expect(await screen.findByRole('alert')).toHaveTextContent('Campaign not found.')
  })
})
