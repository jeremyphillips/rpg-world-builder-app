/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { DataTableUtilityBar } from './data-table-utility-bar.client'

describe('DataTableUtilityBar', () => {
  it('omits empty rows independently', () => {
    const { container } = render(
      <DataTableUtilityBar
        summary={<span>12 results</span>}
        trailingActions={<button type="button">Columns</button>}
      />,
    )

    expect(screen.getByText('12 results')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Columns' })).toBeInTheDocument()
    expect(container.querySelectorAll('[class*="border-b"]').length).toBeGreaterThan(0)
  })

  it('returns null when all slots are empty', () => {
    const { container } = render(<DataTableUtilityBar />)
    expect(container).toBeEmptyDOMElement()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <DataTableUtilityBar
        summary={<span role="status">3 results</span>}
        leadingActions={<button type="button">Select</button>}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
