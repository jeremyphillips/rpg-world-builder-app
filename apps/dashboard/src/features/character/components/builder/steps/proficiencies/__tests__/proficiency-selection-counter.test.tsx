import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ProficiencySelectionCounter } from '../proficiency-selection-counter'

describe('ProficiencySelectionCounter', () => {
  it('renders muted copy while the choice set is incomplete', () => {
    const { container } = render(<ProficiencySelectionCounter selectedCount={1} max={2} />)

    expect(screen.getByText('1 / 2 chosen')).toHaveClass('text-muted-foreground')
    expect(
      container.querySelector('.rounded-full.bg-semantic-success-strong'),
    ).not.toBeInTheDocument()
  })

  it('renders a ready StatusIcon and success copy when the choice set is at capacity', () => {
    const { container } = render(<ProficiencySelectionCounter selectedCount={2} max={2} />)

    expect(screen.getByText('2 / 2 chosen')).toHaveClass('text-semantic-success')
    expect(container.querySelector('.rounded-full.bg-semantic-success-strong')).toBeInTheDocument()
  })

  it('does not treat over-selection as complete', () => {
    const { container } = render(<ProficiencySelectionCounter selectedCount={3} max={2} />)

    expect(screen.getByText('3 / 2 chosen')).toHaveClass('text-muted-foreground')
    expect(
      container.querySelector('.rounded-full.bg-semantic-success-strong'),
    ).not.toBeInTheDocument()
  })
})
