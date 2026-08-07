import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { CatalogPickerItemHeader } from './catalog-picker-item-header.client'
import { CatalogPickerSelectionActions } from './catalog-picker-selection-actions.client'

describe('CatalogPickerItemHeader', () => {
  it('renders name, metadata lines, footer, and actions', () => {
    const { container } = render(
      <CatalogPickerItemHeader
        name="Mage Hand"
        metadataLines={[
          {
            segments: [
              { type: 'badge', text: 'Cantrip', tone: 'neutral', appearance: 'neutral' },
              { type: 'text', text: 'Conjuration' },
            ],
          },
        ]}
        footer={<span>Ritual</span>}
        actions={
          <CatalogPickerSelectionActions
            selected={false}
            canSelect
            onAdd={vi.fn()}
            onRemove={vi.fn()}
          />
        }
      />,
    )

    expect(screen.getByText('Mage Hand')).toBeInTheDocument()
    expect(container).toHaveTextContent('Cantrip')
    expect(screen.getByText('Conjuration')).toBeInTheDocument()
    expect(screen.getByText('Ritual')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <CatalogPickerItemHeader
        name="Detect Magic"
        actions={
          <CatalogPickerSelectionActions
            selected
            canSelect={false}
            onAdd={vi.fn()}
            onRemove={vi.fn()}
          />
        }
      />,
    )

    await expectNoAxeViolations(container)
  })
})

describe('CatalogPickerSelectionActions', () => {
  it('calls add and remove handlers', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    const onRemove = vi.fn()

    const { rerender } = render(
      <CatalogPickerSelectionActions
        selected={false}
        canSelect
        onAdd={onAdd}
        onRemove={onRemove}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(onAdd).toHaveBeenCalledOnce()

    rerender(
      <CatalogPickerSelectionActions
        selected
        canSelect={false}
        onAdd={onAdd}
        onRemove={onRemove}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('uses outline buttons by default', () => {
    render(
      <CatalogPickerSelectionActions
        selected={false}
        canSelect
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Add' })).toHaveClass('border-interactive-outline')
  })

  it('supports a custom add label', () => {
    render(
      <CatalogPickerSelectionActions
        selected={false}
        canSelect
        addLabel="Add as owner"
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Add as owner' })).toBeInTheDocument()
  })

  it('renders success confirmation with precedence over remove', () => {
    render(
      <CatalogPickerSelectionActions phase="success" selected onAdd={vi.fn()} onRemove={vi.fn()} />,
    )

    expect(screen.getByText('✓ Added')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
  })
})
