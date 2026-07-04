import { useState } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  createEditableGridValue,
  EditableGrid,
  type EditableGridColumn,
  type EditableGridProps,
  type EditableGridValue,
} from './editable-grid.client'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

const COLUMNS: EditableGridColumn[] = [
  { key: 'cantrips', label: 'Cantrips', control: 'select', min: 1, max: 3 },
  { key: 'spellsAvailable', label: 'Spells prepared', control: 'number', min: 0 },
]

const TEMPLATES = {
  cantrips: [
    {
      name: 'Flat 2',
      values: [2, 2, 2],
    },
  ],
}

function ControlledGrid(
  props: Omit<EditableGridProps, 'value' | 'onChange'> & {
    initialValue?: EditableGridValue
    onValueChange?: (value: EditableGridValue) => void
  },
) {
  const { initialValue, onValueChange, ...gridProps } = props
  const [value, setValue] = useState(
    initialValue ?? createEditableGridValue(COLUMNS, gridProps.rowCount),
  )

  return (
    <EditableGrid
      {...gridProps}
      value={value}
      onChange={(next) => {
        setValue(next)
        onValueChange?.(next)
      }}
    />
  )
}

describe('EditableGrid', () => {
  it('renders the legend, level labels, and column headers', () => {
    render(
      <ControlledGrid
        id="progression-grid"
        legend="Spell progression"
        columns={COLUMNS}
        rowCount={3}
      />,
    )

    expect(screen.getByText('Spell progression')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Level' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Cantrips/ })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Spells prepared/ })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: '3' })).toBeInTheDocument()
  })

  it('updates a number cell via onChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ControlledGrid
        id="progression-grid"
        columns={COLUMNS}
        rowCount={2}
        onValueChange={onValueChange}
      />,
    )

    const numberInput = screen.getByLabelText('Spells prepared, level 1')
    await user.clear(numberInput)
    await user.type(numberInput, '4')

    expect(onValueChange).toHaveBeenCalled()
    const lastCall = onValueChange.mock.calls.at(-1)?.[0] as EditableGridValue
    expect(lastCall.spellsAvailable?.[0]).toBe(4)
  })

  it('updates a select cell via onChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ControlledGrid
        id="progression-grid"
        columns={COLUMNS}
        rowCount={2}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByLabelText('Cantrips, level 2'))
    await user.click(screen.getByRole('option', { name: '2' }))

    const lastCall = onValueChange.mock.calls.at(-1)?.[0] as EditableGridValue
    expect(lastCall.cantrips?.[1]).toBe(2)
  })

  it('replaces a column after confirming a template', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ControlledGrid
        id="progression-grid"
        columns={COLUMNS}
        rowCount={3}
        templates={TEMPLATES}
        onValueChange={onValueChange}
      />,
    )

    const cantripsHeader = screen.getByRole('columnheader', { name: /Cantrips/ })
    await user.click(within(cantripsHeader).getByRole('button', { name: 'Load template' }))
    await user.click(screen.getByRole('menuitem', { name: 'Flat 2' }))
    await user.click(screen.getByRole('button', { name: 'Replace' }))

    const lastCall = onValueChange.mock.calls.at(-1)?.[0] as EditableGridValue
    expect(lastCall.cantrips).toEqual([2, 2, 2])
  })

  it('shows a field error when provided', () => {
    render(
      <ControlledGrid
        id="progression-grid"
        columns={COLUMNS}
        rowCount={2}
        error="Fix the progression table."
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Fix the progression table.')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <ControlledGrid
        id="progression-grid"
        legend="Spell progression"
        columns={COLUMNS}
        rowCount={3}
        templates={TEMPLATES}
      />,
    )

    await expectNoAxeViolations(container)
  })
})

describe('createEditableGridValue', () => {
  it('builds null-filled columns for each row', () => {
    expect(createEditableGridValue(COLUMNS, 3)).toEqual({
      cantrips: [null, null, null],
      spellsAvailable: [null, null, null],
    })
  })
})
