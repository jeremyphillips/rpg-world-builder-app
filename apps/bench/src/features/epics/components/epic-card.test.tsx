import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axe from 'axe-core'

import { sampleEpic, sampleEpicTickets } from '../test-fixtures'
import { EpicCard } from './epic-card'

describe('EpicCard', () => {
  it('links to epic detail and shows counts', () => {
    render(
      <MemoryRouter>
        <EpicCard
          epic={sampleEpic}
          counts={{ open: 2, blocked: 1, done: 0 }}
          recentlyActive={sampleEpicTickets}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: sampleEpic.title })).toHaveAttribute(
      'href',
      `/epics/${sampleEpic.id}`,
    )
    expect(screen.getByText('Open:')).toBeInTheDocument()
    expect(screen.getByText(/BENCH-001/)).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <EpicCard epic={sampleEpic} counts={{ open: 1, blocked: 0, done: 0 }} recentlyActive={[]} />
      </MemoryRouter>,
    )

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
