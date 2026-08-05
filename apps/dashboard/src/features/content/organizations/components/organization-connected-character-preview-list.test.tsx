import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { OrganizationConnectedCharacterPreviewList } from './organization-connected-character-preview-list.client'

const sampleCard = {
  id: 'char-1',
  name: 'Verna',
  summary: 'Dwarf · Level 1 Fighter',
} as const

describe('OrganizationConnectedCharacterPreviewList', () => {
  it('renders preview rows, view links, and truncation copy from total', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedCharacterPreviewList
          items={[
            {
              card: sampleCard,
              detailHref: '/characters/char-1',
            },
          ]}
          total={3}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Verna')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute('href', '/characters/char-1')
    expect(screen.getByText('+ 2 more')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <OrganizationConnectedCharacterPreviewList
          items={[
            {
              card: sampleCard,
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
