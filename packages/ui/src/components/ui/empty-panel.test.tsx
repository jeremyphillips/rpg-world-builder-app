import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EmptyPanel } from './empty-panel.client'

describe('EmptyPanel', () => {
  it('renders a recessed empty well with status semantics', () => {
    render(<EmptyPanel>No tables added.</EmptyPanel>)

    const panel = screen.getByRole('status')
    expect(panel).toHaveTextContent('No tables added.')
    expect(panel).toHaveClass('bg-sunken')
    expect(panel).toHaveClass('shadow-surface-sunken')
  })

  it('applies muted body typography on the sunken surface', () => {
    render(<EmptyPanel>No grants added.</EmptyPanel>)
    expect(screen.getByRole('status')).toHaveClass('text-muted-foreground')
  })
})
