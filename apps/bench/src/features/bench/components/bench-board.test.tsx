import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { emptyBenchColumns } from '../test-fixtures'
import { BenchBoard } from './bench-board'

describe('BenchBoard', () => {
  it('renders four columns when empty', () => {
    render(<BenchBoard columns={emptyBenchColumns()} epicTitleById={new Map()} />)

    expect(screen.getByRole('region', { name: 'Up Next' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'In Progress' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Blocked' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Done' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <BenchBoard columns={emptyBenchColumns()} epicTitleById={new Map()} />,
    )

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
