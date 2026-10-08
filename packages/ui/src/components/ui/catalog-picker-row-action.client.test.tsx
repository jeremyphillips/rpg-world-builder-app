/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { CatalogPickerRowAction } from './catalog-picker-row-action.client'

const tooltip = {
  title: 'Selection full',
  body: 'Unlearn a spell before learning another.',
}

describe('CatalogPickerRowAction', () => {
  it('keeps a disabled tooltip as one named tab stop and ignores clicks', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <CatalogPickerRowAction
        intent="add"
        actionLabel="Learn"
        disabled
        tooltip={tooltip}
        onClick={onClick}
      />,
    )

    const trigger = screen.getByLabelText(
      'Learn, Selection full, Unlearn a spell before learning another.',
    )
    const button = screen.getByRole('button', { name: 'Learn' })

    expect(trigger).toHaveAttribute('tabindex', '0')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('tabindex', '-1')

    await user.hover(trigger)
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Selection full. Unlearn a spell before learning another.',
    )

    await user.tab()
    expect(trigger).toHaveFocus()
    expect(button).not.toHaveFocus()

    await user.click(button)
    await user.click(trigger)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('announces the stable action under the button and ignores the pending label', () => {
    const { rerender } = render(
      <CatalogPickerRowAction
        intent="add"
        actionLabel="Add"
        pendingLabel="Adding…"
        failed
        onClick={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
    expect(screen.getByRole('status')).toHaveTextContent('Add failed')
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')

    rerender(
      <CatalogPickerRowAction
        intent="add"
        actionLabel="Add"
        pendingLabel="Adding…"
        pending
        failed
        onClick={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Adding…' })).toBeDisabled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('clears the failure on retry, success, a new entity, and a new action', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { rerender } = render(
      <CatalogPickerRowAction
        intent="add"
        actionLabel="Add"
        failed
        entityKey="spell-1"
        onClick={onClick}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Add failed')

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    rerender(
      <CatalogPickerRowAction
        intent="add"
        actionLabel="Add"
        failed={false}
        entityKey="spell-1"
        onClick={onClick}
      />,
    )
    rerender(
      <CatalogPickerRowAction
        intent="add"
        actionLabel="Add"
        failed
        entityKey="spell-1"
        onClick={onClick}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Add failed')

    rerender(
      <CatalogPickerRowAction
        intent="add"
        actionLabel="Add"
        failed={false}
        entityKey="spell-1"
        onClick={onClick}
      />,
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    rerender(
      <CatalogPickerRowAction
        intent="add"
        actionLabel="Add"
        failed
        entityKey="spell-1"
        onClick={onClick}
      />,
    )
    rerender(
      <CatalogPickerRowAction
        intent="add"
        actionLabel="Add"
        failed
        entityKey="spell-2"
        onClick={onClick}
      />,
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    rerender(
      <CatalogPickerRowAction
        intent="add"
        actionLabel="Add"
        failed={false}
        entityKey="spell-2"
        onClick={onClick}
      />,
    )
    rerender(
      <CatalogPickerRowAction
        intent="remove"
        actionLabel="Add"
        failed
        entityKey="spell-2"
        onClick={onClick}
      />,
    )
    rerender(
      <CatalogPickerRowAction
        intent="remove"
        actionLabel="Remove"
        failed
        entityKey="spell-2"
        onClick={onClick}
      />,
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows a failure again after the previous report clears', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [failed, setFailed] = useState(true)
      return (
        <CatalogPickerRowAction
          intent="add"
          actionLabel="Add"
          failed={failed}
          onClick={() => setFailed(false)}
        />
      )
    }

    render(<Harness />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
