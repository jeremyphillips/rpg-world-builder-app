import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PickerSelectionStateLine } from './picker-selection-state-line'

describe('PickerSelectionStateLine', () => {
  it('emphasizes the state word and keeps provenance at regular weight', () => {
    const { container } = render(
      <PickerSelectionStateLine
        density="compact"
        model={{ label: 'Owned', provenance: ['Package ×2', 'Purchased'] }}
      />,
    )

    const word = screen.getByText('Owned')
    expect(word).toHaveClass('text-foreground', 'font-body-emphasis')
    expect(word.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(word.closest('[data-picker-selection-state]')).toHaveClass('text-xs')

    const provenance = screen.getByText('Package ×2')
    expect(provenance).not.toHaveClass('font-body-emphasis')
    expect(provenance).toHaveClass('text-muted-foreground')
    expect(container.querySelector('[data-inline-metadata-separator]')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(container.querySelector('[class*="badge"]')).toBeNull()
  })

  it('renders a state word with no provenance separators', () => {
    const { container } = render(
      <PickerSelectionStateLine density="comfortable" model={{ label: 'Selected' }} />,
    )

    expect(screen.getByText('Selected')).toBeInTheDocument()
    expect(container.querySelector('[data-inline-metadata-separator]')).toBeNull()
    expect(screen.getByText('Selected').closest('[data-picker-selection-state]')).toHaveClass(
      'text-sm',
    )
  })
})
