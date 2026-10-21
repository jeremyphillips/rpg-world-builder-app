import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FeatureTableRow } from './feature-table-row'

describe('FeatureTableRow', () => {
  it('renders a compact entity row and keeps the edit control clickable', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <FeatureTableRow
        title="Rage"
        metadata="2 columns · 5 level breakpoints"
        typeLabel="Level progression"
        onEdit={onEdit}
      />,
    )

    const title = screen.getByText('Rage')
    const row = title.closest('.ui-card')
    expect(row).toHaveClass('ui-card--compact', 'dash-entity-card')
    expect(row).not.toHaveClass('px-3', 'py-2.5')
    expect(screen.getByText('Level progression')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledOnce()
  })
})
