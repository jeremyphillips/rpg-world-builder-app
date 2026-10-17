import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/render'

vi.mock('../hooks/use-monsters', () => ({
  useMonsters: vi.fn(() => ({ data: [], isPending: false, isError: false })),
}))

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => true),
}))

vi.mock('../../lib/overview/content-overview-table', () => ({
  ContentOverviewTable: (props: {
    readOnly?: boolean
    getEditHref?: (row: { id: string }) => string
  }) => (
    <div
      data-testid="overview-table"
      data-read-only={String(Boolean(props.readOnly))}
      data-edit-href={props.getEditHref?.({ id: 'monster_1' }) ?? ''}
    />
  ),
}))

import { MonstersOverview } from './monsters-overview'

describe('MonstersOverview authoring', () => {
  it('offers create and edit affordances', () => {
    renderWithProviders(
      <Routes>
        <Route path="/campaigns/:campaignId/monsters" element={<MonstersOverview />} />
      </Routes>,
      { initialEntries: ['/campaigns/camp_1/monsters'] },
    )

    expect(screen.getByRole('link', { name: /new/i })).toBeInTheDocument()
    expect(screen.getByTestId('overview-table')).toHaveAttribute('data-read-only', 'false')
    expect(screen.getByTestId('overview-table')).toHaveAttribute(
      'data-edit-href',
      '/campaigns/camp_1/monsters/monster_1/edit',
    )
  })
})
