import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/render'

vi.mock('../hooks/use-monsters', () => ({
  useMonsters: vi.fn(() => ({ data: [], isPending: false, isError: false })),
  useMonstersUsageMeta: vi.fn(() => ({ data: undefined })),
}))

vi.mock('../../lib/overview/content-overview-table', () => ({
  ContentOverviewTable: (props: { readOnly?: boolean }) => (
    <div data-testid="overview-table" data-read-only={String(Boolean(props.readOnly))} />
  ),
}))

import { MonstersOverview } from './monsters-overview'

describe('MonstersOverview read-only', () => {
  it('omits create actions and passes readOnly to the overview table', () => {
    renderWithProviders(
      <Routes>
        <Route path="/campaigns/:campaignId/monsters" element={<MonstersOverview />} />
      </Routes>,
      { initialEntries: ['/campaigns/camp_1/monsters'] },
    )

    expect(screen.queryByRole('link', { name: /new/i })).not.toBeInTheDocument()
    expect(screen.getByTestId('overview-table')).toHaveAttribute('data-read-only', 'true')
  })
})
