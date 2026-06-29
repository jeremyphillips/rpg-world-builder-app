import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { EpicTicketCounts } from './epic-ticket-counts'

describe('EpicTicketCounts', () => {
  it('renders zero and non-zero bucket counts', () => {
    const { rerender } = render(<EpicTicketCounts counts={{ open: 0, blocked: 0, done: 0 }} />)

    expect(screen.getByText('Open:')).toBeInTheDocument()
    expect(screen.getAllByText('0')).toHaveLength(3)

    rerender(<EpicTicketCounts counts={{ open: 3, blocked: 1, done: 5 }} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
