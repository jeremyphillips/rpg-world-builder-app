import type { ComponentProps } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { emptyBenchColumns } from '../test-fixtures'
import { BenchBoard } from './bench-board'

function renderBoard(props: ComponentProps<typeof BenchBoard>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <BenchBoard {...props} />
    </QueryClientProvider>,
  )
}

describe('BenchBoard', () => {
  it('renders four columns when empty', () => {
    renderBoard({ columns: emptyBenchColumns(), epicMetaById: new Map() })

    expect(screen.getByRole('region', { name: 'Up Next' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'In Progress' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Blocked' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Done' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderBoard({
      columns: emptyBenchColumns(),
      epicMetaById: new Map(),
    })

    await expectNoAxeViolations(container)
  })
})
