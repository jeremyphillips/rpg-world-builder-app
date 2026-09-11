import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ScrollBoundaryRegion } from './scroll-boundary-region.client'

describe('ScrollBoundaryRegion', () => {
  it('renders a scrollable viewport with boundary shadow overlays', () => {
    render(
      <ScrollBoundaryRegion data-testid="scroll-boundary-viewport">
        <p>Scroll item</p>
      </ScrollBoundaryRegion>,
    )

    const viewport = screen.getByTestId('scroll-boundary-viewport')
    expect(viewport).toHaveClass('overflow-y-auto')
    expect(document.querySelector('[data-visible="false"].bg-gradient-to-b')).toBeInTheDocument()
    expect(document.querySelector('[data-visible="false"].bg-gradient-to-t')).toBeInTheDocument()
  })
})
