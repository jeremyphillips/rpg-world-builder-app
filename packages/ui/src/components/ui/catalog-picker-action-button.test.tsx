/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CatalogPickerActionButton } from './catalog-picker-action-button.client'

describe('CatalogPickerActionButton', () => {
  it('prepends plus for add and minus for remove without changing the accessible name', () => {
    const { rerender } = render(
      <CatalogPickerActionButton intent="add" onClick={vi.fn()}>
        Prepare
      </CatalogPickerActionButton>,
    )

    const addButton = screen.getByRole('button', { name: 'Prepare' })
    expect(addButton.querySelector('svg')).toHaveClass('lucide-plus')
    expect(addButton.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

    rerender(
      <CatalogPickerActionButton intent="remove" onClick={vi.fn()}>
        Unprepare
      </CatalogPickerActionButton>,
    )

    const removeButton = screen.getByRole('button', { name: 'Unprepare' })
    expect(removeButton.querySelector('svg')).toHaveClass('lucide-minus')
  })
})
