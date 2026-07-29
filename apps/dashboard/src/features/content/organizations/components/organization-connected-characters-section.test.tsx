import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { OrganizationConnectedCharactersSection } from './organization-connected-characters-section.client'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'

describe('OrganizationConnectedCharactersSection', () => {
  it('renders preview cards and truncation copy', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedCharactersSection
          connectedCharacters={{
            previewItems: [
              {
                card: {
                  id: 'char-1',
                  name: 'Verna',
                  summary: 'Dwarf · Level 1 Fighter',
                },
                detailHref: '/campaigns/camp-1/characters/char-1',
              },
            ],
            total: 3,
            emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters,
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Connected characters' })).toBeInTheDocument()
    expect(screen.getByText('Verna')).toBeInTheDocument()
    expect(screen.getByText('+ 2 more')).toBeInTheDocument()
  })

  it('renders an empty state when no characters are connected', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedCharactersSection
          connectedCharacters={{
            previewItems: [],
            total: 0,
            emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters,
          }}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByText(ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters),
    ).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <OrganizationConnectedCharactersSection
          connectedCharacters={{
            previewItems: [
              {
                card: {
                  id: 'char-1',
                  name: 'Verna',
                  summary: 'Dwarf · Level 1 Fighter',
                },
                detailHref: '/campaigns/camp-1/characters/char-1',
              },
            ],
            total: 1,
            emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters,
          }}
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
