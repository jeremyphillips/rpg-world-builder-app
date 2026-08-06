/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

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

  it('scopes field-control fills on primary and additional panel shells', () => {
    const { container } = render(
      <DataTableFilterRegion
        primaryFilters={<input aria-label="Search" data-testid="primary-field" />}
        additionalFilterFields={<input aria-label="Advanced field" data-testid="advanced-field" />}
        additionalFiltersOpen
        onAdditionalFiltersOpenChange={() => undefined}
      />,
    )

    const primaryPanel = screen.getByTestId('primary-field').closest('.bg-surface-subtle')
    expect(primaryPanel).toBeTruthy()

    const advancedField = screen.getByTestId('advanced-field')
    const advancedPanel = advancedField.closest('.bg-surface-muted')
    expect(advancedPanel).toHaveClass('[--field-control-bg:var(--field-control-bg-on-muted)]')

    expect(container.querySelector('.contents')).toBeNull()
    expect(screen.getByRole('button', { name: /more filters/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: /more filters/i })).toHaveClass(
      'aria-expanded:border-border',
    )
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
    expect(screen.getByRole('button', { name: 'Collapse' })).toHaveClass('h-control-action-compact')
  })

  it('reserves stacked label height for the More filters rail', () => {
    render(
      <DataTableFilterRegion
        primaryFilters={<input aria-label="Search" />}
        additionalFilterFields={<input aria-label="Advanced field" />}
        additionalFiltersOpen={false}
        onAdditionalFiltersOpenChange={() => undefined}
      />,
    )

    const trigger = screen.getByRole('button', { name: /more filters/i })
    const spacer = trigger.parentElement?.previousElementSibling

    expect(spacer).toHaveClass('invisible', 'text-xs')
    expect(spacer).not.toHaveClass('leading-none')
  })

  itAxe('has no axe accessibility violations', async () => {
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
