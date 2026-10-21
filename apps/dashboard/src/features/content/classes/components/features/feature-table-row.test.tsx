import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FeatureTableRow } from './feature-table-row'

describe('FeatureTableRow', () => {
  it('insets the row at compact density and keeps the edit control clickable', async () => {
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
    const card = title.closest('.ui-card')
    expect(card).not.toHaveClass('px-3', 'py-2.5')
    expect(title.closest('.ui-card__content')).toHaveClass('ui-card__content')
    expect(card).toHaveClass('ui-card--compact')

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledOnce()
  })
})
