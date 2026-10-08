import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CatalogMetadataRenderer } from './catalog-metadata-renderer'

describe('CatalogMetadataRenderer', () => {
  it('emphasizes the strong part inside one metadata item', () => {
    render(
      <CatalogMetadataRenderer
        density="compact"
        lines={[
          {
            segments: [
              {
                type: 'text',
                text: '1st-level Evocation',
                parts: [
                  { text: '1st-level', emphasis: 'strong' },
                  { text: 'Evocation', emphasis: 'default' },
                ],
              },
              { type: 'text', text: 'Action' },
            ],
          },
        ]}
      />,
    )

    expect(screen.getByText('1st-level')).toHaveClass('font-body-emphasis', 'text-foreground')
    expect(screen.getByText('Evocation')).toHaveClass('text-muted-foreground')
    expect(screen.getByText('Evocation')).not.toHaveClass('font-body-emphasis')
    expect(screen.getByText('1st-level').parentElement?.parentElement).toBe(
      screen.getByText('Evocation').parentElement?.parentElement,
    )
  })
})
