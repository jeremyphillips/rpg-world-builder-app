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
  it('omits the disclosure when additional filters are absent', () => {
    const { container } = render(
      <DataTableFilterRegion
        primaryFilters={<input aria-label="Search" data-testid="primary-field" />}
        additionalFiltersOpen={false}
        onAdditionalFiltersOpenChange={() => undefined}
      />,
    )

    expect(screen.queryByRole('button', { name: /additional filters/i })).not.toBeInTheDocument()
    const panel = screen.getByTestId('primary-field').closest('.bg-surface-subtle')
    expect(panel?.querySelector('.border-b')).toBeNull()
    expect(container.querySelector('.bg-surface-muted')).toBeNull()
  })

  it('keeps additional fields in the same panel and shows the active badge while collapsed', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <DataTableFilterRegion
          primaryFilters={<input aria-label="Search" data-testid="primary-field" />}
          additionalFilterFields={
            <input aria-label="Advanced field" data-testid="advanced-field" />
          }
          additionalFiltersOpen={open}
          onAdditionalFiltersOpenChange={setOpen}
          activeAdditionalFilterCount={3}
        />
      )
    }

    const { container } = render(<Harness />)

    const disclosure = screen.getByRole('button', { name: /additional filters/i })
    expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('3 active')).toBeInTheDocument()
    expect(screen.queryByTestId('advanced-field')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Collapse' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /more filters/i })).not.toBeInTheDocument()

    const panel = screen.getByTestId('primary-field').closest('.bg-surface-subtle')
    expect(panel?.querySelector('.border-b')).toBeTruthy()

    await user.click(disclosure)

    const advancedField = screen.getByTestId('advanced-field')
    expect(advancedField.closest('.bg-surface-subtle')).toBe(panel)
    expect(advancedField.closest('.bg-surface-muted')).toBeNull()
    expect(screen.getByRole('button', { name: /additional filters/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText('3 active')).toBeInTheDocument()
    expect(container.querySelector('.contents')).toBeNull()
  })

  it('hides the active badge when no advanced fields differ from their defaults', () => {
    render(
      <DataTableFilterRegion
        primaryFilters={<input aria-label="Search" />}
        additionalFilterFields={<input aria-label="Advanced field" />}
        additionalFiltersOpen={false}
        onAdditionalFiltersOpenChange={() => undefined}
        activeAdditionalFilterCount={0}
      />,
    )

    expect(screen.getByRole('button', { name: 'Additional filters' })).toBeInTheDocument()
    expect(screen.queryByText(/active/i)).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <DataTableFilterRegion
        primaryFilters={<input aria-label="Search" />}
        additionalFilterFields={<input aria-label="Advanced field" />}
        additionalFiltersOpen
        onAdditionalFiltersOpenChange={() => undefined}
        activeAdditionalFilterCount={1}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
