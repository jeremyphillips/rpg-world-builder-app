import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ContentEntityPickerRow } from './content-entity-picker-row.client'

describe('ContentEntityPickerRow', () => {
  it('renders flush row content without card shell chrome', () => {
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
    expect(container.querySelector('article')).not.toBeInTheDocument()

    const row = container.firstElementChild
    expect(row).toHaveClass('w-full')
    expect(row).not.toHaveClass('px-4')
    expect(row).not.toHaveClass('border')
  })

  it('renders inline endSlot actions beside the heading row', () => {
    render(
      <MemoryRouter>
        <ContentEntityPickerRow
          heading="Grey Coast"
          subheading="Region"
          endSlot={<button type="button">Select</button>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
  })

  it('applies disabled treatment and shows fully-linked copy in the subheading', () => {
    const { container } = render(
      <MemoryRouter>
        <ContentEntityPickerRow
          heading="Port City"
          subheading="All site relationship types already linked."
          disabled
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('All site relationship types already linked.')).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('opacity-60')
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
