import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { sampleEpic } from '@/features/epics'

import { EpicBadge, NO_EPIC_BADGE_LABEL } from './epic-badge'

describe('EpicBadge', () => {
  it('links to the epic detail page', () => {
    render(
      <MemoryRouter>
        <EpicBadge epic={{ id: sampleEpic.id, title: sampleEpic.title, badgeColor: '#2563eb' }} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: `Open epic ${sampleEpic.title}` })).toHaveAttribute(
      'href',
      `/epics/${sampleEpic.id}`,
    )
  })

  it('renders a gray badge when no epic is assigned', () => {
    render(
      <MemoryRouter>
        <EpicBadge epic={null} />
      </MemoryRouter>,
    )

    expect(screen.getByText(NO_EPIC_BADGE_LABEL)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <EpicBadge epic={{ id: sampleEpic.id, title: sampleEpic.title, badgeColor: '#2563eb' }} />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
