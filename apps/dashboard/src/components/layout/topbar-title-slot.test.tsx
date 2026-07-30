// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { TopbarTitleSlot } from './topbar-title-slot'

vi.mock('@/features/campaign', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useCampaigns: () => ({
      data: [{ id: 'camp_1', identity: { name: 'The Argent Road' } }],
      isPending: false,
      isError: false,
    }),
  }
})

describe('TopbarTitleSlot', () => {
  it('renders personal workspace outside campaign routes', () => {
    render(
      <MemoryRouter initialEntries={['/characters']}>
        <Routes>
          <Route path="/characters" element={<TopbarTitleSlot />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Personal workspace' })).toHaveAttribute('href', '/')
  })

  it('renders the campaign title inside campaign routes', () => {
    render(
      <MemoryRouter initialEntries={['/campaigns/camp_1/classes']}>
        <Routes>
          <Route path="/campaigns/:campaignId/*" element={<TopbarTitleSlot />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'The Argent Road' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1',
    )
  })
})
