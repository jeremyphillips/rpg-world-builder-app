/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/render'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'

vi.mock('../hooks/use-campaigns', () => ({
  useCampaigns: vi.fn(),
}))

vi.mock('../hooks/use-active-campaign-id', () => ({
  useActiveCampaignId: vi.fn(),
}))

vi.mock('../hooks/use-select-campaign', () => ({
  useSwitchCampaign: vi.fn(),
}))

import { useActiveCampaignId } from '../hooks/use-active-campaign-id'
import { useCampaigns } from '../hooks/use-campaigns'
import { useSwitchCampaign } from '../hooks/use-select-campaign'

import { CampaignSwitcher } from './campaign-switcher'

const useCampaignsMock = vi.mocked(useCampaigns)
const useActiveCampaignIdMock = vi.mocked(useActiveCampaignId)
const useSwitchCampaignMock = vi.mocked(useSwitchCampaign)

describe('CampaignSwitcher', () => {
  beforeEach(() => {
    useSwitchCampaignMock.mockReturnValue(vi.fn())
    useActiveCampaignIdMock.mockReturnValue('camp_1')
    useCampaignsMock.mockReturnValue({
      data: [makeCampaignListItem({ id: 'camp_1', identity: { name: 'Sunless Citadel' } })],
      isPending: false,
      isError: false,
    } as ReturnType<typeof useCampaigns>)
  })

  it('uses compact trigger sizing and truncates the active campaign name', () => {
    renderWithProviders(<CampaignSwitcher showLabel={false} />, {
      initialEntries: ['/campaigns/camp_1'],
    })

    const trigger = screen.getByRole('button', { name: 'Sunless Citadel' })
    expect(trigger).toHaveClass('h-11')
    expect(trigger.querySelector('.truncate')).toHaveTextContent('Sunless Citadel')
  })
})
