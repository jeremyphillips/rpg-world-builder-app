/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChoiceSelectionCounter } from './choice-selection-counter.client'

describe('ChoiceSelectionCounter', () => {
  it('shows muted progress until the requirement is met', () => {
    const { container } = render(<ChoiceSelectionCounter selectedCount={1} max={2} />)

    expect(screen.getByText('1 / 2 chosen')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('shows a success check when the chosen count meets the requirement', () => {
    const { container } = render(<ChoiceSelectionCounter selectedCount={2} max={2} />)

    expect(screen.getByText('2 / 2 chosen')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
