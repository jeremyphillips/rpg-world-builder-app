import type { ComponentProps } from 'react'
import { DndContext } from '@dnd-kit/core'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { upNextTicket } from '../test-fixtures'
import { BenchColumn } from './bench-column'

function renderColumn(props: ComponentProps<typeof BenchColumn>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <DndContext>
        <BenchColumn {...props} />
      </DndContext>
    </QueryClientProvider>,
  )
}

describe('BenchColumn', () => {
  it('shows empty placeholder when no tickets', () => {
    renderColumn({
      column: 'up_next',
      tickets: [],
      epicMetaById: new Map(),
      onMoveTicket: () => undefined,
    })

    expect(screen.getByText('No tickets up next')).toBeInTheDocument()
  })

  it('renders ticket cards when populated', () => {
    renderColumn({
      column: 'up_next',
      tickets: [upNextTicket],
      epicMetaById: new Map(),
      onMoveTicket: () => undefined,
    })

    expect(screen.getByText('BENCH-101')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderColumn({
      column: 'up_next',
      tickets: [upNextTicket],
      epicMetaById: new Map(),
      onMoveTicket: () => undefined,
    })

    await expectNoAxeViolations(container)
  })
})
