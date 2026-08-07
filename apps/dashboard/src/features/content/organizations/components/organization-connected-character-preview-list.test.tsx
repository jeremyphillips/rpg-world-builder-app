import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { OrganizationConnectedCharacterPreviewList } from './organization-connected-character-preview-list.client'

const sampleSummary = {
  id: 'char-1',
  name: 'Verna',
  identitySummary: 'Dwarf · Level 1 Fighter',
  characterType: { value: 'pc' as const, label: 'PC' },
}

describe('OrganizationConnectedCharacterPreviewList', () => {
  it('renders mixed PC/NPC preview rows, view links, and truncation copy from total', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedCharacterPreviewList
          items={[
            {
              summary: sampleSummary,
              detailHref: '/characters/char-1',
            },
          ]}
          total={3}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Verna')).toBeInTheDocument()
    expect(screen.getByText('PC · Dwarf · Level 1 Fighter')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute('href', '/characters/char-1')
    expect(screen.getByText('+ 2 more')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <OrganizationConnectedCharacterPreviewList
          items={[
            {
              summary: sampleSummary,
              detailHref: '/characters/char-1',
            },
          ]}
          total={1}
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
