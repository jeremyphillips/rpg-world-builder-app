import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EmptyPanel } from './empty-panel.client'

describe('EmptyPanel', () => {
  it('renders a recessed passive-message well without default live-region semantics', () => {
    render(<EmptyPanel>No tables added.</EmptyPanel>)

    const panel = screen.getByText('No tables added.')
    expect(panel).not.toHaveAttribute('role', 'status')
    expect(panel).toHaveClass('ui-empty-panel')
  })

  it('applies passive message typography on the sunken surface', () => {
    render(<EmptyPanel>No grants added.</EmptyPanel>)
    expect(screen.getByText('No grants added.')).toHaveClass('ui-empty-panel')
  })
})
