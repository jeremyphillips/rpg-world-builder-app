import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { MemoryRouter } from 'react-router-dom'

import { buildBenchSidebarSections } from './lib/build-bench-sidebar-sections'
import { Sidebar } from './sidebar'

describe('Sidebar', () => {
  it('renders primary navigation links grouped by section', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    const sections = buildBenchSidebarSections()
    expect(screen.getAllByText('Work')).toHaveLength(1)
    expect(screen.getAllByText('Settings')).toHaveLength(2)

    for (const section of sections) {
      for (const { label } of section.items) {
        expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
      }
    }
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
