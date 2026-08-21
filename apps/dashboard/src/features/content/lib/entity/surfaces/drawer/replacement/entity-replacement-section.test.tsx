import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EntityReplacementSection } from './entity-replacement-section.client'

describe('EntityReplacementSection', () => {
  it('renders current summary, unavailable message, and new helper copy', () => {
    render(
      <EntityReplacementSection
        entityLabel="Organization"
        current={{
          entity: {
            heading: 'City Council',
            headingSuffix: ' · Government',
          },
          unavailable: true,
        }}
        newHelper="Choose a different organization."
      />,
    )

    expect(screen.getByText('Current organization')).toBeInTheDocument()
    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(screen.getByText('Government')).toBeInTheDocument()
    expect(
      screen.getByText(
        'The current linked entity could not be loaded. Resolve the reference before changing the target.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('New organization')).toBeInTheDocument()
    expect(screen.getByText('Choose a different organization.')).toBeInTheDocument()
  })

  it('can hide the new section while keeping the current summary', () => {
    render(
      <EntityReplacementSection
        entityLabel="Location"
        current={{
          entity: {
            heading: 'Harborford',
            headingSuffix: ' · Settlement',
          },
        }}
        showNewSection={false}
      />,
    )

    expect(screen.getByText('Current location')).toBeInTheDocument()
    expect(screen.queryByText('New location')).not.toBeInTheDocument()
  })
})
