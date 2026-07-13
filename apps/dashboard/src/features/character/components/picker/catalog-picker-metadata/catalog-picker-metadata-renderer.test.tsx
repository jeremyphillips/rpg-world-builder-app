import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { CatalogPickerMetadataRenderer } from './catalog-picker-metadata-renderer.client'
import type { CatalogPickerMetadataLine } from './catalog-picker-metadata.types'

describe('CatalogPickerMetadataRenderer', () => {
  it('renders nothing when all lines are empty', () => {
    const { container } = render(
      <CatalogPickerMetadataRenderer
        lines={[{ segments: [] }, { segments: [{ type: 'text', text: '' }] }]}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('omits empty segments within a line', () => {
    const { container } = render(
      <CatalogPickerMetadataRenderer
        lines={[
          {
            segments: [
              { type: 'text', text: 'Action' },
              { type: 'text', text: '   ' },
              { type: 'text', text: 'Self' },
            ],
          },
        ]}
      />,
    )

    expect(container).toHaveTextContent('Action · Self')
  })

  it('inserts dot separators only between adjacent text segments', () => {
    render(
      <CatalogPickerMetadataRenderer
        lines={[
          {
            segments: [
              { type: 'text', text: 'Action' },
              { type: 'text', text: 'Self' },
              {
                type: 'badge',
                text: 'Cantrip',
                tone: 'neutral',
                appearance: 'neutral',
              },
              { type: 'text', text: 'Evocation' },
            ],
          },
        ]}
      />,
    )

    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Self')).toBeInTheDocument()
    expect(screen.getByText('Cantrip')).toBeInTheDocument()
    expect(screen.getByText('Evocation')).toBeInTheDocument()
  })

  it('renders multiple non-empty lines', () => {
    const { container } = render(
      <CatalogPickerMetadataRenderer
        lines={[
          {
            segments: [
              { type: 'text', text: 'Action' },
              { type: 'text', text: 'Self' },
            ],
          },
          {
            segments: [
              {
                type: 'badge',
                text: '1st level',
                tone: 'neutral',
                appearance: 'neutral',
              },
              { type: 'text', text: 'Divination' },
            ],
          },
        ]}
      />,
    )

    expect(container).toHaveTextContent('Action · Self')
    expect(screen.getByText('1st level')).toBeInTheDocument()
    expect(screen.getByText('Divination')).toBeInTheDocument()
  })

  it('preserves segment text without trimming display values', () => {
    const lines: CatalogPickerMetadataLine[] = [
      {
        segments: [{ type: 'text', text: 'Finesse · Light · Thrown' }],
      },
    ]

    render(<CatalogPickerMetadataRenderer lines={lines} />)

    expect(screen.getByText('Finesse · Light · Thrown')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <CatalogPickerMetadataRenderer
        lines={[
          {
            segments: [
              { type: 'text', text: 'Action' },
              { type: 'text', text: '60 ft' },
              {
                type: 'badge',
                text: 'Cantrip',
                tone: 'neutral',
                appearance: 'neutral',
              },
              { type: 'text', text: 'Evocation' },
            ],
          },
        ]}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
