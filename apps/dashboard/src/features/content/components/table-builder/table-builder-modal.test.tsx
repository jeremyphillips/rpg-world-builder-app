import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import type { ProgressionTable } from '@rpg/contracts'

import { rageProgressionTableFixture } from '../tables/progression-table-fixtures'
import { TableBuilderModal, type TableBuilderModalProps } from './table-builder-modal'

const ALLOWED_LEVELS = Array.from({ length: 20 }, (_, index) => index + 1)

// jsdom lacks the pointer-capture and scroll APIs Radix Select relies on.
beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => undefined
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => undefined
  }
})

function renderModal(overrides: Partial<TableBuilderModalProps> = {}) {
  const onSave = vi.fn()
  const onOpenChange = vi.fn()
  const onDelete = vi.fn()

  render(
    <TableBuilderModal
      open
      mode="edit"
      value={rageProgressionTableFixture}
      allowedLevels={ALLOWED_LEVELS}
      onSave={onSave}
      onOpenChange={onOpenChange}
      onDelete={onDelete}
      {...overrides}
    />,
  )

  return { onSave, onOpenChange, onDelete }
}

describe('TableBuilderModal', () => {
  it('renders the persisted draft: name, columns, and sparse rows', () => {
    renderModal()

    expect(screen.getByRole('dialog', { name: 'Edit table' })).toBeInTheDocument()
    expect(screen.getByLabelText(/^table name/i)).toHaveValue('Rage progression')
    expect(screen.getByLabelText('Column name 1')).toHaveValue('Rages')
    expect(screen.getByLabelText('Column name 2')).toHaveValue('Rage Damage')

    // Breakpoint union: 1, 3, 6, 9.
    expect(screen.getByRole('combobox', { name: 'Level, row 4' })).toHaveTextContent('9')
    // Sparse cell: Rage Damage has no entry at level 3.
    expect(screen.getByLabelText('Rages, level 3')).toHaveValue('3')
    expect(screen.getByLabelText('Rage Damage, level 3')).toHaveValue('')
  })

  it('round-trips an unchanged draft through save', async () => {
    const user = userEvent.setup()
    const { onSave, onOpenChange } = renderModal()

    await user.click(screen.getByRole('button', { name: 'Save table' }))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave.mock.calls[0]?.[0]).toEqual(rageProgressionTableFixture)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('appends the next unused level after the final breakpoint on add row', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('button', { name: 'Add row' }))

    // Max used level is 9 → next unused allowed level is 10.
    expect(screen.getByRole('combobox', { name: 'Level, row 5' })).toHaveTextContent('10')
  })

  it('disables levels used by other rows in the level select', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('combobox', { name: 'Level, row 1' }))

    const listbox = await screen.findByRole('listbox')
    expect(within(listbox).getByRole('option', { name: '3' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(within(listbox).getByRole('option', { name: '2' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('confirms and clears values when changing the type of a populated column', async () => {
    const user = userEvent.setup()
    const { onSave } = renderModal()

    await user.click(screen.getByRole('combobox', { name: 'Column type for Rages' }))
    await user.click(await screen.findByRole('option', { name: 'Text' }))

    const confirm = await screen.findByRole('alertdialog', { name: 'Change column type?' })
    await user.click(within(confirm).getByRole('button', { name: 'Change type' }))

    // Cells cleared → column values now blank everywhere.
    expect(screen.getByLabelText('Rages, level 1')).toHaveValue('')

    // Saving now fails: Rages has no value in any row.
    await user.click(screen.getByRole('button', { name: 'Save table' }))
    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByText('Rages needs a value in at least one row.')).toBeInTheDocument()
  })

  it('switches an empty column type immediately without confirmation', async () => {
    const user = userEvent.setup()
    renderModal({ mode: 'create', value: undefined })

    await user.click(screen.getByRole('button', { name: 'Add column' }))
    await user.click(screen.getByRole('combobox', { name: 'Column type for column 1' }))
    await user.click(await screen.findByRole('option', { name: 'Dice' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Column type for column 1' })).toHaveTextContent(
      'Dice',
    )
  })

  it('shows validation errors on empty create submit and keeps the modal open', async () => {
    const user = userEvent.setup()
    const { onSave, onOpenChange } = renderModal({ mode: 'create', value: undefined })

    await user.click(screen.getByRole('button', { name: 'Add table' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByText('Enter a table name.')).toBeInTheDocument()
    expect(screen.getByText('Add at least one column.')).toBeInTheDocument()
    expect(screen.getByText('Add at least one row.')).toBeInTheDocument()
  })

  it('saves an authored dice table with structured values', async () => {
    const user = userEvent.setup()
    const { onSave } = renderModal({ mode: 'create', value: undefined })

    await user.type(screen.getByLabelText(/^table name/i), 'Martial Arts')
    await user.click(screen.getByRole('button', { name: 'Add column' }))
    await user.type(screen.getByLabelText('Column name 1'), 'Martial Arts Die')
    await user.click(screen.getByRole('combobox', { name: 'Column type for Martial Arts Die' }))
    await user.click(await screen.findByRole('option', { name: 'Dice' }))

    await user.click(screen.getByRole('button', { name: 'Add row' }))
    await user.click(screen.getByRole('combobox', { name: 'Martial Arts Die, level 1, die size' }))
    await user.click(await screen.findByRole('option', { name: 'd6' }))

    await user.click(screen.getByRole('button', { name: 'Add table' }))

    expect(onSave).toHaveBeenCalledTimes(1)
    const saved = onSave.mock.calls[0]?.[0] as ProgressionTable
    expect(saved).toMatchObject({
      id: 'martial-arts',
      name: 'Martial Arts',
      kind: 'levelProgression',
    })
    expect(saved.columns[0]).toMatchObject({
      id: 'martial-arts-die',
      valueType: 'dice',
      entries: [{ level: 1, value: { count: 1, faces: 6 } }],
    })
  })

  it('guards cancel with a discard confirmation when dirty', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderModal()

    await user.type(screen.getByLabelText(/^table name/i), ' (updated)')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).not.toHaveBeenCalled()
    const confirm = await screen.findByRole('alertdialog', { name: 'Discard changes?' })
    await user.click(within(confirm).getByRole('button', { name: 'Discard' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes immediately on cancel when pristine', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderModal()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('deletes only after confirmation', async () => {
    const user = userEvent.setup()
    const { onDelete, onOpenChange } = renderModal()

    await user.click(screen.getByRole('button', { name: 'Delete table' }))
    expect(onDelete).not.toHaveBeenCalled()

    const confirm = await screen.findByRole('alertdialog', { name: 'Delete table?' })
    await user.click(within(confirm).getByRole('button', { name: 'Delete table' }))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('hides the delete action in create mode', () => {
    renderModal({ mode: 'create', value: undefined })
    expect(screen.queryByRole('button', { name: 'Delete table' })).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    renderModal()
    await expectNoAxeViolations(screen.getByRole('dialog'))
  })
})
