import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { MemoryRouter } from 'react-router-dom'

import { BENCH_NAV_ITEMS } from '@/app/routes'

import { Sidebar } from './sidebar'

describe('Sidebar', () => {
  it('renders primary navigation links', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    for (const { label } of BENCH_NAV_ITEMS) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
