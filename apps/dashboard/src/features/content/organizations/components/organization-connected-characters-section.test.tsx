import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ORGANIZATION_CONNECTED_CHARACTERS_LOAD_ERROR } from '../lib/organization-connected-characters.constants'
import { OrganizationConnectedCharactersSection } from './organization-connected-characters-section.client'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'

const sampleConnectedCharacters = {
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
}

describe('OrganizationConnectedCharactersSection', () => {
  it('renders count, preview cards, and truncation copy', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedCharactersSection connectedCharacters={sampleConnectedCharacters} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Connected characters' })).toBeInTheDocument()
    expect(screen.getByText('3 connected characters')).toBeInTheDocument()
    expect(screen.getByText('Verna')).toBeInTheDocument()
    expect(screen.getByText('+ 2 more')).toBeInTheDocument()
  })

  it('renders singular count copy for one connected character', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedCharactersSection
          connectedCharacters={{
            ...sampleConnectedCharacters,
            total: 1,
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('1 connected character')).toBeInTheDocument()
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

  it('renders loading copy while pending', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedCharactersSection
          connectedCharacters={{
            previewItems: [],
            total: 0,
            emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters,
          }}
          isPending
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(
      screen.queryByText(ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters),
    ).not.toBeInTheDocument()
  })

  it('renders error copy when the query fails', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedCharactersSection
          connectedCharacters={{
            previewItems: [],
            total: 0,
            emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters,
          }}
          isError
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(ORGANIZATION_CONNECTED_CHARACTERS_LOAD_ERROR)).toBeInTheDocument()
    expect(
      screen.queryByText(ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters),
    ).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <OrganizationConnectedCharactersSection connectedCharacters={sampleConnectedCharacters} />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
