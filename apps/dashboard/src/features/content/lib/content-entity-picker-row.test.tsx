import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ContentEntityPickerRow } from './content-entity-picker-row.client'

describe('ContentEntityPickerRow', () => {
  it('renders compact ghost entity presentation without navigation', () => {
    const { container } = render(
      <MemoryRouter>
        <ContentEntityPickerRow
          heading="Grey Coast"
          subheading="Region"
          imageKey="locations/grey-coast.png"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Grey Coast')).toBeInTheDocument()
    expect(screen.getByText('Region')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Grey Coast' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()

    const card = container.querySelector('article')
    expect(card).toBeInTheDocument()
    expect(card).not.toHaveClass('border')
  })

  it('applies disabled treatment and shows fully-linked copy in the subheading', () => {
    render(
      <MemoryRouter>
        <ContentEntityPickerRow
          heading="Port City"
          subheading="All site relationship types already linked."
          disabled
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('All site relationship types already linked.')).toBeInTheDocument()
    expect(screen.getByText('Port City').closest('article')).toHaveClass('opacity-60')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <ContentEntityPickerRow heading="Silver Circle" subheading="Guild" />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
