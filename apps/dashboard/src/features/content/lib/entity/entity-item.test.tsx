import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { EntityItem } from '../content-entity-card.client'
import { GREY_COAST_ENTITY, HARBOR_DISTRICT_ENTITY } from './entity.fixture'

describe('EntityItem', () => {
  it('renders heading, classification, and description', () => {
    render(
      <MemoryRouter>
        <EntityItem entity={HARBOR_DISTRICT_ENTITY} density="compact" />
      </MemoryRouter>,
    )

    expect(screen.getByText('Harbor District')).toBeInTheDocument()
    expect(screen.getByText(/Settlement overview/)).toBeInTheDocument()
    expect(screen.getByText('Located in Grey Coast')).toBeInTheDocument()
  })

  it('wraps the heading in a link when href is provided', () => {
    render(
      <MemoryRouter>
        <EntityItem
          entity={GREY_COAST_ENTITY}
          href="/campaigns/demo/locations/grey-coast"
          density="compact"
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Grey Coast' })).toHaveAttribute(
      'href',
      '/campaigns/demo/locations/grey-coast',
    )
  })

  it('renders leading and action seams', () => {
    render(
      <MemoryRouter>
        <EntityItem
          entity={GREY_COAST_ENTITY}
          leading={<span data-testid="leading">Grip</span>}
          action={<button type="button">Select</button>}
          density="compact"
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('leading')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
  })
})
