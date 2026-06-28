import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { upNextTicket } from '../test-fixtures'
import { BenchColumn } from './bench-column'

function renderColumn(props: React.ComponentProps<typeof BenchColumn>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <BenchColumn {...props} />
    </QueryClientProvider>,
  )
}

describe('BenchColumn', () => {
  it('shows empty placeholder when no tickets', () => {
    renderColumn({ column: 'up_next', tickets: [], epicTitleById: new Map() })

    expect(screen.getByText('No tickets up next')).toBeInTheDocument()
  })

  it('renders ticket cards when populated', () => {
    renderColumn({ column: 'up_next', tickets: [upNextTicket], epicTitleById: new Map() })

    expect(screen.getByText('BENCH-101')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderColumn({
      column: 'up_next',
      tickets: [upNextTicket],
      epicTitleById: new Map(),
    })

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
