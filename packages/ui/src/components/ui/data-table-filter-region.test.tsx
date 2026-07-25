/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { DataTableFilterRegion } from './data-table-filter-region.client'

describe('DataTableFilterRegion', () => {
  it('omits the trigger rail when additional filters are absent', () => {
    render(
      <DataTableFilterRegion
        primaryFilters={<input aria-label="Search" />}
        additionalFiltersOpen={false}
        onAdditionalFiltersOpenChange={() => undefined}
      />,
    )

    expect(screen.queryByRole('button', { name: /more filters/i })).not.toBeInTheDocument()
  })

  it('toggles the additional filters panel', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <DataTableFilterRegion
          primaryFilters={<input aria-label="Search" />}
          additionalFilterFields={<input aria-label="Advanced field" />}
          additionalFiltersOpen={open}
          onAdditionalFiltersOpenChange={setOpen}
          activeAdditionalFilterCount={2}
        />
      )
    }

    render(<Harness />)

    await user.click(screen.getByRole('button', { name: /Show more filters, 2 active/i }))
    expect(screen.getByText('Additional filters')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <DataTableFilterRegion
        primaryFilters={<input aria-label="Search" />}
        additionalFilterFields={<input aria-label="Advanced field" />}
        additionalFiltersOpen
        onAdditionalFiltersOpenChange={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
