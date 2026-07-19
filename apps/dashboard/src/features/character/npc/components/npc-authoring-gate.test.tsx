import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { NpcAuthoringGate } from './npc-authoring-gate.client'

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(),
}))

import { useCanManageCampaign } from '@/features/campaign'

const mockUseCanManageCampaign = vi.mocked(useCanManageCampaign)

describe('NpcAuthoringGate', () => {
  it('renders children when the user can manage the campaign', () => {
    mockUseCanManageCampaign.mockReturnValue(true)

    render(
      <NpcAuthoringGate campaignId="camp-1">
        <p>NPC content</p>
      </NpcAuthoringGate>,
    )

    expect(screen.getByText('NPC content')).toBeInTheDocument()
  })

  it('shows a permission alert when the user cannot manage the campaign', () => {
    mockUseCanManageCampaign.mockReturnValue(false)

    render(
      <NpcAuthoringGate campaignId="camp-1">
        <p>NPC content</p>
      </NpcAuthoringGate>,
    )

    expect(screen.queryByText('NPC content')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(/permission/i)
  })
})
